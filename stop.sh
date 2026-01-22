#!/bin/bash
# MiroFish 停止脚本
# 用于停止所有运行中的 MiroFish 服务

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MiroFish 停止服务脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 查找并停止 Flask 后端进程
echo -e "${YELLOW}[1/3] 正在停止后端服务...${NC}"
BACKEND_PID=$(ps aux | grep "python run.py" | grep -v grep | awk '{print $2}')
if [ -n "$BACKEND_PID" ]; then
    kill $BACKEND_PID
    echo -e "${GREEN}✓ 后端服务已停止 (PID: $BACKEND_PID)${NC}"
else
    echo -e "${YELLOW}未找到运行中的后端服务${NC}"
fi

# 查找并停止 Vite 前端进程
echo -e "${YELLOW}[2/3] 正在停止前端服务...${NC}"
FRONTEND_PID=$(ps aux | grep "vite" | grep -v grep | awk '{print $2}')
if [ -n "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID
    echo -e "${GREEN}✓ 前端服务已停止 (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${YELLOW}未找到运行中的前端服务${NC}"
fi

# 查找并停止所有相关 Python 进程
echo -e "${YELLOW}[3/3] 清理残留进程...${NC}"
PYTHON_PIDS=$(ps aux | grep "python.*run.py" | grep -v grep | awk '{print $2}')
if [ -n "$PYTHON_PIDS" ]; then
    for pid in $PYTHON_PIDS; do
        kill $pid 2>/dev/null
        echo -e "${GREEN}✓ 已清理 Python 进程 (PID: $pid)${NC}"
    done
else
    echo -e "${YELLOW}无残留进程${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  所有服务已停止${NC}"
echo -e "${GREEN}========================================${NC}"
