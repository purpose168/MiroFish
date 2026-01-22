#!/bin/bash
# MiroFish 前端启动脚本
# 用于启动 Vite 前端开发服务器

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MiroFish 前端服务启动脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 Node.js 是否可用
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未找到 Node.js${NC}"
    echo -e "${YELLOW}请先安装 Node.js (版本 >= 18.0.0)${NC}"
    exit 1
fi

# 检查 Node.js 版本
NODE_VERSION=$(node -v)
echo -e "${GREEN}[1/3] Node.js 版本: ${BLUE}${NODE_VERSION}${NC}"

# 检查 npm 是否可用
if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: 未找到 npm${NC}"
    exit 1
fi

# 检查依赖是否安装
echo -e "${GREEN}[2/3] 检查前端依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}警告: node_modules 目录不存在，正在安装依赖...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}错误: 依赖安装失败${NC}"
        exit 1
    fi
fi

# 检查 package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 未找到 package.json 文件${NC}"
    exit 1
fi

# 启动前端服务
echo -e "${GREEN}[3/3] 启动前端服务...${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  启动前端服务${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}服务地址: http://localhost:3000${NC}"
echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"
echo ""

# 启动 Vite 开发服务器
npm run dev
