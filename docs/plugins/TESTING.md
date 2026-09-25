# Xime 测试指南

## 测试架构

本项目采用多层测试策略，确保代码质量和稳定性。

### 测试类型

#### 1. 单元测试 (Unit Tests)
- **位置**: `app/src/test/java/`、`plugin-core/src/test/java/`
- **目的**: 测试纯 Kotlin 逻辑，不依赖 Android 框架
- **适用场景**: 
  - 工具类方法测试
  - 业务逻辑测试
  - 算法测试
  - JS 插件沙箱与适配器测试

**示例测试类**:
- `SchemaConfigHelperTest` - 测试配置解析逻辑
- `ExtensionManagerTest` - 测试插件管理逻辑
- `JsScriptRuntimeTest` - 测试 JS 沙箱运行环境
- `JsAsrPluginAdapterTest` / `JsAsrPluginTest` - 测试 ASR 插件适配器
- `JsKaomojiTest` / `JsMemeBunnyTest` / `JsVolcAsrPluginTest` - 测试真实插件脚本
- `ManifestParseTest` - 测试插件 manifest 解析
- `VersionUtilTest` - 测试插件宿主版本兼容性检查
- `PluginSignatureUtilTest` - 测试插件信任等级判定
- `NetworkPolicyTest` - 测试插件网络策略

#### 2. T9 核心 C++ 单元测试
- **位置**: `app/src/main/jni/librime-t9/test/`
- **框架**: GoogleTest
- **目的**: 测试 T9 输入法 C++ 插件核心算法（缓冲区、状态机、撤销模型、右侧选词、拼音映射、音节对齐等）
- **运行方式**:

```bash
# 在 app/src/main/jni/ 下执行（需要 CMake + gtest）
cd app/src/main/jni/librime-t9
./run_t9_tests.sh
```

共 11 个测试文件、约 266 个用例，覆盖 `t9_buffer`、`t9_state_machine`、`t9_undo_model`、`t9_right_commit_handler`、`t9_pinyin_map`、`t9_syllable_alignment`、`t9_patch_utils` 等模块。

#### 3. 仪器测试 (Instrumented Tests)
- **位置**: `app/src/androidTest/java/`
- **目的**: 测试与 Android 框架交互的组件
- **运行速度**: 较慢（需要在设备/模拟器上运行）
- **适用场景**:
  - 数据库操作测试
  - SharedPreferences 测试
  - Context 相关测试
  - Native 库交互测试

**示例测试类**:
- `RimeEngineTest` - 测试 RIME 引擎初始化和基本操作
- `ExtensionManagerInstrumentedTest` - 测试插件管理器的实际加载

#### 4. UI 测试 (UI Tests)
- **位置**: `app/src/androidTest/java/`
- **框架**: Jetpack Compose Testing
- **目的**: 测试 UI 组件的行为和外观
- **运行速度**: 中等
- **适用场景**:
  - Compose 组件测试
  - 用户交互测试
  - 界面状态测试

**示例测试类**:
- `CandidateBarTest` - 测试候选词栏 UI 组件

## 运行测试

### 运行所有单元测试
```bash
./gradlew test
```

### 运行所有仪器测试
```bash
./gradlew connectedAndroidTest
```

### 运行特定测试类
```bash
# 单元测试
./gradlew test --tests "com.kingzcheung.xime.settings.SchemaConfigHelperTest"
./gradlew :plugin-core:test --tests "com.kingzcheung.xime.plugin.core.js.JsAsrPluginTest"

# 仪器测试
./gradlew connectedAndroidTest --tests "com.kingzcheung.xime.rime.RimeEngineTest"
```

### 运行 T9 C++ 测试
```bash
cd app/src/main/jni/librime-t9
./run_t9_tests.sh              # 构建并运行全部测试
./run_t9_tests.sh -f T9UndoModel*   # 运行指定测试（gtest filter）
./run_t9_tests.sh --no-build   # 跳过构建，直接运行
```

### 运行所有测试
```bash
./gradlew connectedCheck
```

## 插件脚本测试（xipm test）

插件作者通常不需要跑整个宿主测试套件：`xipm` 内嵌与真机同款的 QuickJS 引擎和 v3 契约的 mock host，`xipm test` 可直接在本地运行插件的 `main.test.ts`，无需真机或 Node：

```bash
# 先编译（测试基于 build/plugin-js 下的产物运行）
cd tools/xime-plugin
cargo run -- build --all --plugins-dir ../../plugins --out ../../build/plugin-js

# 批量测试（无测试文件的插件跳过）
cargo run -- test
# 单插件（也可在插件目录内零参数运行）
cargo run -- test ../../plugins/my-plugin
# 无 main.test.ts 时仅做加载冒烟
cargo run -- test ../../plugins/my-plugin --smoke
```

测试环境要点：

- 网络 / WS / SSE **必须显式 stub**（`__ximeMock.addHttpResponse` / `addWs` / `addSse`），未注册的请求 reject `E_NETWORK`，绝不真实联网
- 可断言调用记录：`httpRequests` / `sentWs` / `asrEvents` / `quickSend` / `clipboard`
- 可控时钟：`__ximeMock.setClock(epochSeconds)`
- 插件 `console.log/error` 前缀化输出到终端

测试 API 与完整说明见 [插件开发指南](./PLUGIN_DEVELOPMENT_GUIDE#测试) 与 [插件开发教程](./PLUGIN_DEV_TUTORIAL#第-2-步-测试插件)。

## 测试最佳实践

### 1. 测试命名规范
使用描述性测试名称，使用反引号包含空格：
```kotlin
@Test
fun `parseSchemaYaml should parse valid schema`() {
    // 测试代码
}
```

### 2. 测试结构
遵循 AAA 模式：
- **Arrange** - 准备测试数据
- **Act** - 执行被测试的代码
- **Assert** - 验证结果

```kotlin
@Test
fun `getCandidates should return empty array when not initialized`() {
    // Arrange
    val engine = RimeEngine.getInstance()
    
    // Act
    val candidates = engine.getCandidates()
    
    // Assert
    assertTrue(candidates.isEmpty())
}
```

### 3. 使用测试规则
```kotlin
class MyTest {
    @get:Rule
    val coroutineTestRule = CoroutineTestRule()
    
    @get:Rule
    val sharedPreferencesRule = SharedPreferencesTestRule()
}
```

### 4. 测试隔离
每个测试应该独立运行，不依赖其他测试的结果：
```kotlin
@Before
fun setup() {
    // 重置状态
    ExtensionManager.release()
}

@After
fun tearDown() {
    // 清理资源
    ExtensionManager.release()
}
```

### 5. Mock 外部依赖
使用 Mockito 模拟外部依赖：
```kotlin
@Test
fun `plugin should return emojis correctly`() {
    val mockPlugin = mock<EmojiPlugin>()
    `when`(mockPlugin.getEmojis(null, null, 10)).thenReturn(
        listOf(EmojiItem("1", "(^_^)", "(^_^)", null, "kaomoji"))
    )
    
    val result = mockPlugin.getEmojis(null, null, 10)
    assertEquals(1, result.size)
}
```

## 测试覆盖率

### 生成测试覆盖率报告
```bash
./gradlew createDebugCoverageReport
```

报告位置：`app/build/reports/coverage/debug/index.html`

## 持续集成 (CI)

在 CI 环境中运行测试：
```yaml
# .github/workflows/test.yml
- name: Run Unit Tests
  run: ./gradlew test

- name: Run Instrumented Tests
  run: ./gradlew connectedAndroidTest
```

## 测试工具类

### CoroutineTestRule
用于测试协程代码：
```kotlin
class MyViewModelTest {
    @get:Rule
    val coroutineTestRule = CoroutineTestRule()
    
    @Test
    fun testCoroutine() = runTest {
        // 测试协程代码
    }
}
```

### SharedPreferencesTestRule
用于测试 SharedPreferences：
```kotlin
class SettingsTest {
    @get:Rule
    val prefsRule = SharedPreferencesTestRule()
    
    @Test
    fun testSettings() {
        val prefs = prefsRule.getSharedPreferences()
        // 测试代码
    }
}
```

## 常见测试场景

### 1. 测试 Singleton
```kotlin
@Test
fun `getInstance should return singleton`() {
    val instance1 = RimeEngine.getInstance()
    val instance2 = RimeEngine.getInstance()
    
    assertSame(instance1, instance2)
}
```

### 2. 测试异步操作
```kotlin
@Test
fun `predict should return results`() = runTest {
    val result = ExtensionManager.predict(context, "测试", 5)
    
    assertNotNull(result)
    assertTrue(result.isNotEmpty())
}
```

### 3. 测试 Compose UI
```kotlin
@Test
fun `CandidateBar should display candidates`() {
    val candidates = listOf("你好", "世界")
    
    composeTestRule.setContent {
        CandidateBar(
            candidates = candidates,
            selectedIndex = 0,
            onCandidateClick = {},
            onCandidateLongClick = {}
        )
    }
    
    composeTestRule.onNodeWithText("你好").assertIsDisplayed()
}
```

## 故障排查

### 测试失败常见原因

1. **Native 库未加载**
   - 确保在仪器测试中正确初始化 RimeEngine
   - 使用 `@Before` 注解的 setup 方法初始化

2. **Context 为空**
   - 使用 `InstrumentationRegistry.getInstrumentation().targetContext`

3. **协程测试超时**
   - 使用 `runTest` 而不是 `runBlocking`
   - 配置 `TestDispatcher`

4. **Compose 测试找不到节点**
   - 检查是否使用了正确的语义属性
   - 使用 `printToLog()` 调试 UI 树

## 扩展阅读

- [Android 测试文档](https://developer.android.com/training/testing)
- [Jetpack Compose 测试](https://developer.android.com/jetpack/compose/testing)
- [Kotlin 协程测试](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/)
- [Mockito 文档](https://site.mockito.org/)