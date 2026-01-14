#!/bin/bash

echo "📦 检查 agconnect-services.json..."

# 本地文件已存在就跳过
if [ -f "android/app/agconnect-services.json" ]; then
  echo "✅ 本地文件已存在，大小: $(wc -c < android/app/agconnect-services.json) bytes"
  exit 0
fi

# EAS 云端构建时，file 类型环境变量会自动设置为文件路径
if [ -n "$AGCONNECT_SERVICES_JSON" ] && [ -f "$AGCONNECT_SERVICES_JSON" ]; then
  cp "$AGCONNECT_SERVICES_JSON" android/app/agconnect-services.json
  echo "✅ 已从 EAS 环境变量复制"
  exit 0
fi

echo "❌ agconnect-services.json 不存在"
echo "本地构建请先运行: cp .eas/.env/AGCONNECT_SERVICES_JSON android/app/agconnect-services.json"
exit 1
