#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_DIR="/opt/ai-weight-coach"
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.prod.yml"
CURRENT_DEPLOY_ENV="${PROJECT_DIR}/.deploy.env"
NEXT_DEPLOY_ENV="${PROJECT_DIR}/.deploy.next.env"
PREVIOUS_DEPLOY_ENV="${PROJECT_DIR}/.deploy.previous.env"
PROJECT_NAME="ai-weight-coach"

require_value() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "缺少必需的环境变量: ${name}" >&2
    exit 1
  fi
}

log() {
  printf '[deploy] %s\n' "$*"
}

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose --project-name "${PROJECT_NAME}" -f "${COMPOSE_FILE}" "$@"
    return
  fi

  docker-compose -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" "$@"
}

http_probe() {
  local url="$1"

  if command -v curl >/dev/null 2>&1; then
    curl --fail --silent --show-error "${url}" >/dev/null
    return
  fi

  if command -v wget >/dev/null 2>&1; then
    wget -qO- "${url}" >/dev/null
    return
  fi

  echo "服务器未安装 curl 或 wget，无法执行健康检查。" >&2
  return 1
}

wait_for_http() {
  local url="$1"
  local label="$2"
  local retries="${3:-20}"
  local delay="${4:-3}"

  for ((attempt = 1; attempt <= retries; attempt += 1)); do
    if http_probe "${url}"; then
      log "${label} is healthy: ${url}"
      return
    fi

    sleep "${delay}"
  done

  echo "${label} 健康检查未通过: ${url}" >&2
  return 1
}

wait_for_container_health() {
  local container_name="$1"
  local label="$2"
  local retries="${3:-30}"
  local delay="${4:-2}"

  for ((attempt = 1; attempt <= retries; attempt += 1)); do
    local status
    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "${container_name}" 2>/dev/null || true)"

    if [[ "${status}" == "healthy" || "${status}" == "running" ]]; then
      log "${label} is healthy"
      return
    fi

    sleep "${delay}"
  done

  echo "${label} 健康检查未通过" >&2
  return 1
}

rollback() {
  local exit_code=$?

  log "部署失败，开始回滚"

  if [[ -f "${CURRENT_DEPLOY_ENV}" ]]; then
    compose --env-file "${CURRENT_DEPLOY_ENV}" up -d mysql backend web || true
  else
    log "未找到上一个部署版本的环境文件，保留当前状态以便排查"
  fi

  compose ps || true
  exit "${exit_code}"
}

require_value "ACR_REGISTRY"
require_value "ALIYUN_ACR_USERNAME"
require_value "ALIYUN_ACR_PASSWORD"
require_value "WEB_IMAGE_REPOSITORY"
require_value "BACKEND_IMAGE_REPOSITORY"

IMAGE_TAG="${1:-${IMAGE_TAG:-}}"
if [[ -z "${IMAGE_TAG}" ]]; then
  echo "用法: deploy.sh <image-tag>" >&2
  exit 1
fi

WEB_IMAGE="${ACR_REGISTRY}/${WEB_IMAGE_REPOSITORY}:${IMAGE_TAG}"
BACKEND_IMAGE="${ACR_REGISTRY}/${BACKEND_IMAGE_REPOSITORY}:${IMAGE_TAG}"

mkdir -p "${PROJECT_DIR}"
cd "${PROJECT_DIR}"

trap rollback ERR

log "登录 ACR: ${ACR_REGISTRY}"
printf '%s' "${ALIYUN_ACR_PASSWORD}" | docker login "${ACR_REGISTRY}" --username "${ALIYUN_ACR_USERNAME}" --password-stdin

cat >"${NEXT_DEPLOY_ENV}" <<EOF
WEB_IMAGE=${WEB_IMAGE}
BACKEND_IMAGE=${BACKEND_IMAGE}
EOF

log "拉取目标镜像"
compose --env-file "${NEXT_DEPLOY_ENV}" pull web backend

log "启动 mysql"
compose --env-file "${NEXT_DEPLOY_ENV}" up -d mysql
wait_for_container_health "ai-weight-coach-mysql" "mysql"

log "执行 Prisma 迁移"
compose --env-file "${NEXT_DEPLOY_ENV}" run --rm backend npx prisma migrate deploy

log "启动 backend"
compose --env-file "${NEXT_DEPLOY_ENV}" up -d backend
wait_for_http "http://127.0.0.1:3001/api/v1/health" "backend"

log "启动 web"
compose --env-file "${NEXT_DEPLOY_ENV}" up -d web
wait_for_http "http://127.0.0.1:3000" "web"

if [[ -f "${CURRENT_DEPLOY_ENV}" ]]; then
  cp "${CURRENT_DEPLOY_ENV}" "${PREVIOUS_DEPLOY_ENV}"
fi

mv "${NEXT_DEPLOY_ENV}" "${CURRENT_DEPLOY_ENV}"
trap - ERR

log "部署完成"
compose --env-file "${CURRENT_DEPLOY_ENV}" ps
