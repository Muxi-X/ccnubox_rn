# 类型系统规范

本文档描述了项目中 TypeScript 类型系统的组织结构和最佳实践。

## 目录结构

```
src/
├── types/                    # 全局类型定义
│   ├── index.ts             # 类型统一导出
│   ├── common.ts            # 通用类型定义
│   ├── tabBarTypes.ts       # 导航栏类型
│   ├── mainPageGridTypes.ts # 主页网格类型
│   ├── settingItem.ts       # 设置项类型
│   ├── FeedIconTypes.ts     # 订阅图标类型
│   ├── feedback.ts          # 反馈类型
│   ├── updateInfo.ts        # 更新信息类型
│   ├── axios.d.ts           # Axios 类型扩展
│   └── image.d.ts           # 图片模块类型声明
├── components/              # 组件
│   └── [component]/
│       ├── index.tsx        # 组件实现
│       └── types.ts         # 组件类型定义
├── request/                 # API 请求
│   ├── api/
│   │   └── [module]/
│   │       ├── types.ts     # API 模块类型
│   │       └── *.ts         # API 函数
│   └── schema.d.ts          # OpenAPI 类型定义
└── utils/                   # 工具函数
    └── eventBus.ts          # 事件总线（含类型定义）
```

## 类型定义规范

### 1. 通用类型 (`src/types/common.ts`)

所有通用、可复用的类型定义应放在 `common.ts` 中：

```typescript
// 回调函数类型
export type Callback<T extends unknown[] = []> = (...args: T) => void;

// 异步回调函数类型
export type AsyncCallback<T extends unknown[] = [], R = void> = (
  ...args: T
) => Promise<R>;

// 值变化处理器
export type ValueChangeHandler<T = string> = (value: T) => void;

// API 响应包装器
export interface ApiResponse<T = unknown> {
  data: T;
  code: number;
  message?: string;
}
```

### 2. 组件类型定义

每个组件应有独立的 `types.ts` 文件（如果类型定义较多）：

**推荐：**
```
src/components/button/
├── index.tsx
└── types.ts    // 导出 ButtonProps
```

**组件 Props 命名规范：**
- 使用 `[ComponentName]Props` 格式
- 示例：`ButtonProps`, `ModalProps`, `SearchBarProps`

**样式类型使用：**
```typescript
import { StyleProp, ViewStyle, TextStyle } from 'react-native';

export interface MyComponentProps {
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}
```

❌ **禁止使用 `any` 作为样式类型**

### 3. API 类型定义

每个 API 模块应有独立的 `types.ts` 文件：

```
src/request/api/feeds/
├── types.ts              // 导出请求/响应类型
├── queryFeedAllowList.ts
├── changeFeedAllowList.ts
└── saveFeedToken.ts
```

**示例：**
```typescript
// src/request/api/feeds/types.ts
export interface FeedAllowListData {
  allow: boolean;
  feedId?: string;
}

// src/request/api/feeds/changeFeedAllowList.ts
import { FeedAllowListData } from './types';

export const changeFeedAllowList = async (data: FeedAllowListData) => {
  return await request.post('/feed/changeFeedAllowList', data);
};
```

### 4. 事件类型定义

使用泛型定义类型安全的事件处理器：

```typescript
// ❌ 不推荐
eventBus.on('userLogin', (data: any) => {
  console.log(data.userId);
});

// ✅ 推荐
interface UserLoginEvent {
  userId: string;
  username: string;
}

eventBus.on<[UserLoginEvent]>('userLogin', (data) => {
  console.log(data.userId); // 类型安全
});
```

### 5. 类型导入规范

**集中导入通用类型：**
```typescript
import { Callback, ApiResponse } from '@/types';
```

**导入特定模块类型：**
```typescript
import { SettingItem } from '@/types/settingItem';
import { MainPageGridDataType } from '@/types/mainPageGridTypes';
```

## 最佳实践

### ✅ 推荐做法

1. **使用具体类型而非 `any`**
   ```typescript
   // ❌ 错误
   const response: any = await getPrice(id);
   
   // ✅ 正确
   const response: PriceResponse = await getPrice(id);
   ```

2. **使用泛型增强类型复用**
   ```typescript
   // ✅ 正确
   interface ListResponse<T> {
     data: T[];
     total: number;
   }
   ```

3. **类型定义与实现分离**
   ```typescript
   // types.ts
   export interface ButtonProps {
     onPress: () => void;
   }
   
   // index.tsx
   import { ButtonProps } from './types';
   export const Button: React.FC<ButtonProps> = (props) => { ... };
   ```

4. **使用 TypeScript 原生类型**
   ```typescript
   import { StyleProp, ViewStyle, TextStyle, GestureResponderEvent } from 'react-native';
   
   interface Props {
     containerStyle?: StyleProp<ViewStyle>;
     onPress?: (event: GestureResponderEvent) => void;
   }
   ```

### ❌ 避免的做法

1. **不要在多个文件中重复定义相同类型**
2. **不要使用 `any` 绕过类型检查**
3. **不要忽略 TypeScript 编译错误**
4. **不要在组件内部定义可复用的类型**

## 类型检查

运行类型检查命令：

```bash
# 检查类型错误
pnpm tsc --noEmit

# 开启严格模式（已在 tsconfig.json 中配置）
# "strict": true
```

## 工具推荐

1. **VS Code 插件**
   - TypeScript Importer
   - Error Lens（实时显示类型错误）

2. **代码检查**
   - ESLint with TypeScript rules
   - Prettier for code formatting

## 迁移指南

如果你在旧代码中发现类型问题，请按以下步骤修复：

1. 识别 `any` 类型的使用位置
2. 确定正确的类型定义
3. 如果类型不存在，在相应的 `types.ts` 中创建
4. 更新代码使用正确的类型
5. 运行 `pnpm tsc --noEmit` 验证

## 参考资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Expo TypeScript 指南](https://docs.expo.dev/guides/typescript/)
