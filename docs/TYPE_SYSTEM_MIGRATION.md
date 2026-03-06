# 类型系统迁移指南

本指南帮助开发者将现有代码迁移到新的类型系统。

## 快速检查清单

在开始迁移之前，使用以下命令检查类型问题：

```bash
# 查找所有使用 'any' 的文件
grep -r ": any" src/ --include="*.ts" --include="*.tsx"

# 运行 TypeScript 类型检查
pnpm tsc --noEmit
```

## 常见迁移场景

### 1. 事件处理器

#### ❌ 迁移前
```typescript
interface Props {
  onPress?: (_e: any) => void;
  onChange?: (value: any) => void;
}
```

#### ✅ 迁移后
```typescript
import { GestureResponderEvent } from 'react-native';
import { ValueChangeHandler } from '@/types';

interface Props {
  onPress?: (e: GestureResponderEvent) => void;
  onChange?: ValueChangeHandler<string>;
}
```

---

### 2. 样式属性

#### ❌ 迁移前
```typescript
interface Props {
  style?: any;
  containerStyle?: any;
  textStyle?: any;
}
```

#### ✅ 迁移后
```typescript
import { StyleProp, ViewStyle, TextStyle } from 'react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}
```

---

### 3. API 请求参数

#### ❌ 迁移前
```typescript
export const updateUser = async (data: any) => {
  return await request.post('/user/update', data);
};
```

#### ✅ 迁移后
```typescript
// 1. 创建类型定义文件 src/request/api/user/types.ts
export interface UpdateUserData {
  userId: string;
  username?: string;
  email?: string;
}

// 2. 更新 API 函数
import { UpdateUserData } from './types';

export const updateUser = async (data: UpdateUserData) => {
  return await request.post('/user/update', data);
};
```

---

### 4. API 响应处理

#### ❌ 迁移前
```typescript
const fetchUser = async (id: string) => {
  const response: any = await getUser(id);
  return response.data;
};
```

#### ✅ 迁移后
```typescript
// 1. 定义响应类型
interface User {
  id: string;
  username: string;
  email: string;
}

// 2. 使用类型
const fetchUser = async (id: string): Promise<User> => {
  const response = await getUser(id);
  return response.data;
};

// 或使用通用类型
import { ApiResponse } from '@/types';

const fetchUser = async (id: string): Promise<ApiResponse<User>> => {
  return await getUser(id);
};
```

---

### 5. 事件总线

#### ❌ 迁移前
```typescript
eventBus.on('userLogin', (data: any) => {
  console.log(data.userId);
});

eventBus.emit('userLogin', { userId: '123' });
```

#### ✅ 迁移后
```typescript
// 1. 定义事件类型
interface UserLoginEvent {
  userId: string;
  username: string;
  timestamp: number;
}

// 2. 使用类型化事件
eventBus.on<[UserLoginEvent]>('userLogin', (data) => {
  console.log(data.userId); // 完整类型支持
});

eventBus.emit<[UserLoginEvent]>('userLogin', {
  userId: '123',
  username: 'test',
  timestamp: Date.now(),
});
```

---

### 6. 回调函数

#### ❌ 迁移前
```typescript
interface Props {
  onComplete?: (result: any) => void;
  onError?: (error: any) => void;
}
```

#### ✅ 迁移后
```typescript
import { Callback } from '@/types';

interface Props {
  onComplete?: Callback<[result: string]>;
  onError?: Callback<[error: Error]>;
}

// 或更具体
interface Props {
  onComplete?: (result: string) => void;
  onError?: (error: Error) => void;
}
```

---

### 7. 选择器/下拉框选项

#### ❌ 迁移前
```typescript
const options = [
  { label: '选项1', value: 1 },
  { label: '选项2', value: 2 },
];

const handleSelect = (item: any) => {
  console.log(item.value);
};
```

#### ✅ 迁移后
```typescript
import { SelectOption } from '@/types';

const options: SelectOption<number>[] = [
  { label: '选项1', value: 1 },
  { label: '选项2', value: 2 },
];

const handleSelect = (item: SelectOption<number>) => {
  console.log(item.value);
};
```

---

### 8. 组件 Ref

#### ❌ 迁移前
```typescript
const MyComponent = forwardRef<any, Props>((props, ref) => {
  // ...
});
```

#### ✅ 迁移后
```typescript
// 1. 定义 Ref 类型
export interface MyComponentRef {
  reset: () => void;
  getValue: () => string;
}

// 2. 使用类型化 Ref
const MyComponent = forwardRef<MyComponentRef, Props>((props, ref) => {
  useImperativeHandle(ref, () => ({
    reset: () => { /* ... */ },
    getValue: () => { /* ... */ },
  }));
  // ...
});
```

---

### 9. Hook 参数

#### ❌ 迁移前
```typescript
const useCustomHook = (fn: (...args: any[]) => any) => {
  // ...
};
```

#### ✅ 迁移后
```typescript
const useCustomHook = <T extends (...args: never[]) => unknown>(
  fn: T
) => {
  // ...
};

// 或使用 Callback 类型
import { Callback } from '@/types';

const useCustomHook = <T extends unknown[]>(
  fn: Callback<T>
) => {
  // ...
};
```

---

### 10. 错误处理

#### ❌ 迁移前
```typescript
try {
  // ...
} catch (error: any) {
  console.error(error.message);
}
```

#### ✅ 迁移后
```typescript
import { AppError } from '@/types';

try {
  // ...
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    const appError: AppError = {
      code: 'UNKNOWN_ERROR',
      message: String(error),
    };
    console.error(appError);
  }
}
```

---

## 高级类型使用

### 使用类型工具函数

```typescript
import { PartialBy, RequiredBy, Override } from '@/types';

// 使某些属性可选
interface User {
  id: string;
  name: string;
  email: string;
}

type OptionalEmailUser = PartialBy<User, 'email'>;
// { id: string; name: string; email?: string; }

// 使某些属性必需
type RequiredUser = RequiredBy<Partial<User>, 'id'>;
// { id: string; name?: string; email?: string; }

// 类型合并
interface BaseProps {
  id: string;
  name: string;
}

interface ExtendedProps {
  name: number; // 覆盖 name 的类型
  age: number;
}

type MergedProps = Override<BaseProps, ExtendedProps>;
// { id: string; name: number; age: number; }
```

---

## 迁移步骤

### 第一步：识别问题代码

使用以下命令找到需要迁移的文件：

```bash
# 查找所有 'any' 使用
grep -rn ": any" src/ --include="*.ts" --include="*.tsx" > any-usage.txt

# 查找事件处理器
grep -rn "(_e: any)" src/ --include="*.ts" --include="*.tsx"
```

### 第二步：规划迁移

1. 优先迁移公共组件和工具函数
2. 然后迁移 API 层
3. 最后迁移页面组件

### 第三步：逐步迁移

每次迁移一个文件或模块：

1. 添加正确的类型定义
2. 更新导入语句
3. 运行 `pnpm tsc --noEmit` 检查错误
4. 修复类型错误
5. 提交代码

### 第四步：验证

```bash
# 运行类型检查
pnpm tsc --noEmit

# 运行 linter
pnpm lint

# 运行测试（如果有）
pnpm test
```

---

## 常见问题

### Q: 遇到复杂的类型错误怎么办？

A: 
1. 使用 `// @ts-expect-error` 临时标记（并添加注释说明原因）
2. 简化类型定义
3. 将复杂类型拆分为多个简单类型
4. 查阅 TypeScript 文档或咨询团队

### Q: 什么时候可以使用 `any`？

A: 
- 处理完全动态的数据（极少情况）
- 第三方库没有类型定义且无法推断
- 临时解决方案（必须添加 TODO 注释）

**推荐使用 `unknown` 代替 `any`，然后进行类型守卫。**

### Q: 类型定义应该放在哪里？

A:
- 全局通用类型 → `src/types/common.ts`
- 组件相关类型 → `src/components/[name]/types.ts`
- API 相关类型 → `src/request/api/[module]/types.ts`
- 工具函数类型 → 与实现代码同文件或单独 `types.ts`

### Q: 如何处理第三方库的类型问题？

A:
1. 检查是否有 `@types/[package]` 包
2. 创建 `*.d.ts` 文件扩展类型
3. 提交 PR 到 DefinitelyTyped

---

## 获取帮助

- 查看 [类型系统规范文档](./TYPE_SYSTEM.md)
- 查看 [重构说明文档](./TYPE_SYSTEM_REFACTOR.md)
- TypeScript 官方文档：https://www.typescriptlang.org/docs/
- React TypeScript Cheatsheet：https://react-typescript-cheatsheet.netlify.app/

---

## 检查清单

迁移完成后，确认以下内容：

- [ ] 文件中没有使用 `any` 类型（除非有充分理由）
- [ ] 所有导入路径正确
- [ ] 运行 `pnpm tsc --noEmit` 无错误
- [ ] 运行 `pnpm lint` 无错误
- [ ] 代码逻辑没有改变
- [ ] 添加了必要的类型定义文件
- [ ] 更新了相关文档（如果需要）
