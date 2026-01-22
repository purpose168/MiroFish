#!/bin/bash
# MiroFish 总启动脚本
# 同时启动前端和后端服务

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  MiroFish 项目启动脚本${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# 检查是否安装了 concurrently
if ! command -v concurrently &> /dev/null; then
    echo -e "${YELLOW}检测到未安装 concurrently，正在安装...${NC}"
    npm install -g concurrently
fi

# 检查 conda 是否可用
if ! command -v conda &> /dev/null; then
    echo -e "${RED}错误: 未找到 conda 命令${NC}"
    echo -e "${YELLOW}请确保已安装 Anaconda 或 Miniconda${NC}"
    exit 1
fi

# 检查 conda 环境是否存在
ENV_EXISTS=$(conda env list | grep "^mirofish " | wc -l)
if [ "$ENV_EXISTS" -eq 0 ]; then
    echo -e "${RED}错误: conda 环境 mirofish 不存在${NC}"
    echo -e "${YELLOW}请先创建环境: conda create -n mirofish python=3.11${NC}"
    exit 1
fi

echo -e "${GREEN}✓ conda 环境 mirofish 已就绪${NC}"
echo -e "${GREEN}✓ 前端依赖已就绪${NC}"
echo -e "${GREEN}✓ 后端依赖已就绪${NC}"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  启动 MiroFish 服务${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}前端地址: ${CYAN}http://localhost:3000${NC}"
echo -e "${GREEN}后端地址: ${CYAN}http://127.0.0.1:5001${NC}"
echo ""
echo -e "${YELLOW}按 Ctrl+C 停止所有服务${NC}"
echo ""

# 使用 concurrently 同时启动前后端
# 后端使用自定义脚本，前端使用 npm run dev
concurrently \
    --kill-others \
    --names "BACKEND,FRONTEND" \
    --prefix-colors "green,cyan" \
    "cd backend && ./start.sh" \
    "cd frontend && npm run dev"
