#!/bin/bash
# MiroFish 后端启动脚本
# 用于启动 Python Flask 后端服务

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
echo -e "${BLUE}  MiroFish 后端服务启动脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 conda 是否可用
if ! command -v conda &> /dev/null; then
    echo -e "${RED}错误: 未找到 conda 命令${NC}"
    echo -e "${YELLOW}请确保已安装 Anaconda 或 Miniconda${NC}"
    exit 1
fi

# 激活 conda 环境
echo -e "${GREEN}[1/3] 正在激活 conda 环境 mirofish...${NC}"
source "$(conda info --base)/etc/profile.d/conda.sh"
conda activate mirofish

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 无法激活 conda 环境 mirofish${NC}"
    echo -e "${YELLOW}请先创建环境: conda create -n mirofish python=3.11${NC}"
    exit 1
fi

# 检查 Python 版本
echo -e "${GREEN}[2/3] 检查 Python 版本...${NC}"
PYTHON_VERSION=$(python --version 2>&1)
echo -e "当前 Python 版本: ${GREEN}${PYTHON_VERSION}${NC}"

# 检查依赖是否安装
echo -e "${GREEN}[3/3] 检查依赖...${NC}"
python -c "import flask, openai, zep_cloud, camel, tiktoken" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}警告: 部分依赖未安装，正在安装...${NC}"
    pip install -r requirements.txt
fi

# 启动后端服务
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  启动后端服务${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}服务地址: http://127.0.0.1:5001${NC}"
echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"
echo ""

# 启动 Flask 应用
python run.py
