# 类型系统重构说明

## 概述

本次重构对项目的 TypeScript 类型系统进行了全面改进，提升了类型安全性、可维护性和代码质量。

## 主要改进

### 1. EventBus 类型安全化

**问题：** EventBus 使用 `any[]` 作为参数类型，导致事件处理器缺乏类型检查。

**解决方案：** 引入泛型参数，支持类型安全的事件处理。

```typescript
// 改进前
eventBus.on('userLogin', (data: any) => {
  console.log(data.userId); // 无类型检查
});

// 改进后
interface UserLoginEvent {
  userId: string;
  username: string;
}

eventBus.on<[UserLoginEvent]>('userLogin', (data) => {
  console.log(data.userId); // 完整类型支持
});
```

**文件：** `src/utils/eventBus.ts`

### 2. 组件样式属性类型化

**问题：** 多个组件使用 `any` 作为样式属性类型。

**解决方案：** 使用 React Native 提供的 `StyleProp<ViewStyle>` 和 `StyleProp<TextStyle>`。

```typescript
// 改进前
export interface SearchBarProps {
  containerStyle?: any;
  inputStyle?: any;
}

// 改进后
import { StyleProp, ViewStyle, TextStyle } from 'react-native';

export interface SearchBarProps {
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}
```

**文件：**
- `src/components/searchBar/type.ts`
- `src/components/modal/types.ts`

### 3. API 请求类型定义

**问题：** API 函数参数使用 `any` 类型。

**解决方案：** 为每个 API 模块创建专门的类型定义文件。

```typescript
// 改进前
export const changeFeedAllowList = async (data: any) => {
  return await request.post('/feed/changeFeedAllowList', data);
};

// 改进后
export interface FeedAllowListData {
  allow: boolean;
  feedId?: string;
}

export const changeFeedAllowList = async (data: FeedAllowListData) => {
  return await request.post('/feed/changeFeedAllowList', data);
};
```

**文件：**
- `src/request/api/feeds/types.ts`
- `src/request/api/feeds/changeFeedAllowList.ts`
- `src/request/api/feeds/saveFeedToken.ts`
- `src/request/api/errorLogger.ts`

### 4. 事件处理器类型

**问题：** 组件事件处理器使用 `any` 类型。

**解决方案：** 使用 `GestureResponderEvent` 类型。

```typescript
// 改进前
export interface TabBarItemProps {
  onPress?: (_e: any) => void;
  onLongPress?: (_e: any) => void;
}

// 改进后
import { GestureResponderEvent } from 'react-native';

export interface TabBarItemProps {
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: (e: GestureResponderEvent) => void;
}
```

**文件：** `src/components/navi/types.ts`

### 5. Hook 类型改进

**问题：** 自定义 hooks 使用 `any[]` 作为函数参数类型。

**解决方案：** 使用泛型提供类型安全。

```typescript
// 改进前
export default function useTimeoutFn(
  fn: (...args: any[]) => void,
  ms: number = 0
)

// 改进后
export default function useTimeoutFn<T extends unknown[] = []>(
  fn: (...args: T) => void,
  ms: number = 0
)
```

**文件：**
- `src/hooks/useTimeoutFn.ts`
- `src/hooks/useDebounce.ts`

### 6. Portal 组件类型

**问题：** PortalRoot 使用 `any` 作为 ref 类型。

**解决方案：** 定义专门的 ref 接口。

```typescript
// 改进前
const PortalRoot = forwardRef<any, ModalPortalProps>(...)

// 改进后
export interface PortalRootRef {
  setChildren: (newChildren: React.ReactNode) => void;
}

const PortalRoot = forwardRef<PortalRootRef, ModalPortalProps>(...)
```

**文件：** `src/components/portal/index.tsx`

## 新增文件

### 1. 通用类型定义

**文件：** `src/types/common.ts`

提供项目中常用的通用类型：

- `Callback<T>` - 通用回调函数类型
- `AsyncCallback<T, R>` - 异步回调函数类型
- `ValueChangeHandler<T>` - 值变化处理器
- `ApiResponse<T>` - API 响应包装器
- `PaginationParams` / `PaginationMeta` - 分页相关类型
- `PressHandler` / `AsyncPressHandler` - 事件处理器类型
- `SelectOption<T>` - 选择器选项类型
- `AppError` - 应用错误类型

### 2. 类型工具函数

**文件：** `src/types/utilities.ts`

提供高级类型操作工具：

- `PartialBy<T, K>` - 使指定属性可选
- `RequiredBy<T, K>` - 使指定属性必需
- `DeepPartial<T>` - 深度可选类型
- `Nullable<T>` / `NonNullableFields<T>` - 空值处理
- `FunctionProperties<T>` / `NonFunctionProperties<T>` - 属性过滤
- `Promisify<T>` / `UnwrapPromise<T>` - Promise 操作
- `Override<T, U>` - 类型合并
- 更多...

### 3. 类型导出索引

**文件：** `src/types/index.ts`

集中导出所有类型定义，便于统一导入：

```typescript
import { Callback, ApiResponse, PressHandler } from '@/types';
```

### 4. 类型系统文档

**文件：** `docs/TYPE_SYSTEM.md`

完整的类型系统规范文档，包含：
- 目录结构说明
- 类型定义规范
- 最佳实践指南
- 迁移指南
- 参考资源

## 改进统计

- ✅ 修复了 20+ 个 `any` 类型使用
- ✅ 新增 50+ 个可复用类型定义
- ✅ 改进 10+ 个组件/工具的类型安全
- ✅ 创建完整的类型系统文档

## 后续建议

虽然本次重构已经解决了核心的类型问题，但还有一些改进空间：

1. **API 响应类型**
   - 建议从 `schema.d.ts` 生成完整的 API 响应类型
   - 替换应用代码中的 `any` 响应类型

2. **组件 Props 标准化**
   - 建议统一所有组件的 Props 定义位置
   - 大型组件使用独立的 `types.ts` 文件
   - 小型组件可以内联定义

3. **状态管理类型**
   - 为 Zustand store 添加更严格的类型定义
   - 使用类型推断减少重复类型声明

4. **表单类型**
   - 创建统一的表单字段类型
   - 为表单验证添加类型支持

## 使用建议

1. **新代码**
   - 优先使用 `src/types` 中的通用类型
   - 避免使用 `any` 类型
   - 遵循 `docs/TYPE_SYSTEM.md` 中的规范

2. **旧代码迁移**
   - 逐步替换 `any` 类型
   - 运行 `pnpm tsc --noEmit` 检查类型错误
   - 参考文档中的迁移指南

3. **代码审查**
   - 确保新增代码没有使用 `any`
   - 检查类型定义是否合理
   - 验证导入路径是否正确

## 参考资源

- [类型系统文档](./TYPE_SYSTEM.md)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
