# Xime 插件开发完整指南

## 插件系统架构

Xime 采用动态加载插件架构，表情插件只提供数据，由主应用负责展示。

```
┌─────────────────────────────────────────────┐
│          主应用 (Xime  APK)                   │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │   PluginManager                      │   │
│  │   - PluginClassLoader 加载插件APK    │   │
│  │   - PluginLifecycleManager 管理生命周期 │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │   ExtensionManager                   │   │
│  │   - 管理表情数据                     │   │
│  │   - 提供 emojiCategoriesFlow        │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
            │
            │ PluginClassLoader 加载
            ▼
┌─────────────────────────────────────────────┐
│       插件 APK (独立安装)                    │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │   EmojiPlugin 实现                   │   │
│  │   - onLoad(PluginContext)            │   │
│  │   - onUnload()                       │   │
│  │   - getEmojis() 提供表情数据         │   │
│  │   - getCategories() 提供分类         │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  插件不需要 UI，不依赖 Compose              │
└─────────────────────────────────────────────┘
```

## 核心概念

### 插件类型

Xime 目前只支持表情插件类型：

| 类型 | 接口 | 用途 |
|------|------|------|
| EMOJI | EmojiPlugin | 表情输入（颜文字、贴纸等） |

**重要特性**：
- 插件只提供资源数据（EmojiItem）
- 主应用负责展示和交互
- 插件不需要 UI 代码，不依赖 Compose

## 开发插件步骤

### 1. 创建项目结构

```
my-kime-plugin/
├── build.gradle.kts
└── src/main/
    ├── AndroidManifest.xml
    ├── assets/           # 表情资源文件（可选）
    └── java/com/example/plugin/
        ├── PluginDeclaration.kt      # 空的 Activity（用于插件发现）
        └── MyPlugin.kt               # 实现 EmojiPlugin
```

### 2. 配置 build.gradle.kts

```kotlin
plugins {
    // AGP 9.0+ 已内置 Kotlin 编译支持
    // 如果使用 AGP 9.0+，不需要单独应用 kotlin-android 插件
    id("com.android.application")
    id("org.jetbrains.kotlin.android") version "2.3.20" apply false
}

android {
    namespace = "com.example.kime.plugin"
    compileSdk = 36
    
    defaultConfig {
        applicationId = "com.example.kime.plugin.myplugin"
        minSdk = 28
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }
    
    buildTypes {
        release {
            // 推荐禁用混淆，避免 Kotlin stdlib 方法丢失
            isMinifyEnabled = false
            isShrinkResources = false
        }
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    
    // AGP 9.0+ 中改用 kotlinCompilerOptions 块（如果使用旧版 AGP，请使用 kotlin 块）
    // kotlin {
    //     compilerOptions {
    //         jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    //     }
    // }
}

dependencies {
    // compileOnly 依赖，插件运行时由 PluginClassLoader 加载
    compileOnly(project(":plugin-core"))
    
    // 不需要 appcompat、material、core-ktx 等 UI 库
    // 插件不需要 UI，不依赖 Compose
}
```

**关键点**：
- `compileOnly(project(":plugin-core"))` - 插件核心接口
- `isMinifyEnabled = false` - 推荐禁用混淆，避免 Kotlin stdlib 方法丢失
- 即使禁用混淆，某些 Kotlin stdlib 方法仍可能被宿主应用的 R8 规则裁剪，详见[插件可用的 API 范围](#6-插件可用的-api-范围)
- 不需要 Compose 依赖（插件无 UI）

> ⚠️ **AGP 9.0+ 注意事项**：如果使用 AGP 9.0 及以上版本，
> 不需要显式应用 `kotlin("android")` 或 `org.jetbrains.kotlin.android` 插件，
> AGP 已内置 Kotlin 编译支持。但仍需在 `build.gradle.kts` 中配置
> Kotlin 编译选项（如 `compileOptions` 中的 jvmTarget）。

### 3. 配置 AndroidManifest.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <application
        android:allowBackup="false"
        android:label="@string/app_name"
        android:supportsRtl="true">
        
        <!-- 插件声明 Activity（必须） -->
        <activity
            android:name=".PluginDeclaration"
            android:exported="true">
            <intent-filter>
                <action android:name="com.kingzcheung.xime.plugin.EXTENSION" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>
        
        <!-- 插件元数据 -->
        <meta-data
            android:name="plugin.entryClass"
            android:value="com.example.plugin.MyPlugin" />
        
        <meta-data
            android:name="plugin.description"
            android:value="提供精选表情" />
        
        <meta-data
            android:name="plugin.type"
            android:value="emoji" />
        
    </application>

</manifest>
```

**关键点**：
- `PluginDeclaration` Activity 用于插件发现
- `plugin.entryClass` 指定插件入口类
- `plugin.type` 必须是 `emoji`

### 4. 实现插件入口类

```kotlin
package com.example.plugin

import android.content.Context
import android.util.Log
import com.kingzcheung.xime.plugin.core.api.EmojiItem
import com.kingzcheung.xime.plugin.core.api.EmojiPlugin
import com.kingzcheung.xime.plugin.core.api.PluginIcon
import com.kingzcheung.xime.plugin.core.model.PluginContext
import java.io.File
import java.util.zip.ZipFile

class MyPlugin : EmojiPlugin {
    
    private var pluginContext: PluginContext? = null
    private var emojiList: List<EmojiItem> = emptyList()
    
    companion object {
        private const val TAG = "MyPlugin"
    }
    
    override fun onLoad(context: PluginContext) {
        this.pluginContext = context
        Log.d(TAG, "Plugin loaded: ${context.pluginInfo.id}")
        
        val filesDir = context.application.filesDir
        
        // 加载表情数据
        loadEmojis(filesDir, context.pluginInfo.path)
        
        Log.d(TAG, "Loaded ${emojiList.size} emojis")
    }
    
    override fun onUnload() {
        emojiList = emptyList()
        pluginContext = null
        Log.d(TAG, "Plugin unloaded")
    }
    
    private fun loadEmojis(filesDir: File, apkPath: String?) {
        val emojis = mutableListOf<EmojiItem>()
        
        // 从 APK assets 加载表情
        val actualApkPath = apkPath ?: pluginContext?.application?.applicationInfo?.sourceDir
        if (actualApkPath != null) {
            try {
                ZipFile(File(actualApkPath)).use { zip ->
                    zip.entries().asSequence()
                        .filter { it.name.startsWith("assets/emojis/") && !it.isDirectory }
                        .forEach { entry ->
                            val fileName = entry.name.substringAfter("assets/emojis/")
                            emojis.add(
                                EmojiItem(
                                    id = "emoji_$fileName",
                                    displayText = fileName,
                                    insertText = fileName,
                                    imageUrl = null, // 或本地文件路径
                                    category = "默认"
                                    // displayConfig 可选，不传则使用默认配置
                                )
                            )
                        }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to load emojis", e)
            }
        }
        
        emojiList = emojis
    }
    
    override suspend fun getEmojis(
        category: String?, 
        searchText: String?, 
        topK: Int
    ): List<EmojiItem> {
        val filtered = if (searchText.isNullOrEmpty()) emojiList
        else emojiList.filter { 
            it.displayText.contains(searchText) || it.insertText.contains(searchText)
        }
        return filtered.take(topK)
    }
    
    override suspend fun getCategories(): List<String> {
        return emojiList.map { it.category }.distinct()
    }
    
    override fun getIcon(): PluginIcon? = PluginIcon(assetName = "icon.png")
    // 注意：assetName 必须是纯文件名，不能包含路径（如 "emojis/icon.png" 会报错）
    
    // 或者使用文本图标（推荐，简单可靠）：
    // override fun getIcon(): PluginIcon? = PluginIcon(text = "🐰")
    
    // hasSettings() 默认返回 false，不需要设置界面
    // openSettings() 默认空实现
}
```

### 5. 实现空的 PluginDeclaration

```kotlin
package com.example.plugin

import android.app.Activity
import android.os.Bundle

class PluginDeclaration : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 空实现，用于插件发现
    }
}
```

### 6. 插件可用的 API 范围

插件通过宿主应用的 `PluginClassLoader` 加载，Kotlin stdlib 来自宿主应用。
宿主应用的 ProGuard/R8 规则决定了哪些 Kotlin stdlib 方法会保留。

#### 宿主应用保留的 Kotlin stdlib 包

宿主应用明确保留了以下 Kotlin stdlib 包，**插件可以安全使用**：

| 包 | 说明 |
|------|------|
| `kotlin.jvm.internal` | JVM 内部实现（如 `Intrinsics`） |
| `kotlin.collections` | 集合操作（`listOf`、`mapOf`、`filter`、`map` 等） |
| `kotlin.text` | 字符串处理（`split`、`replace`、`contains` 等） |
| `kotlin.comparisons` | 比较操作（`compareBy`、`thenBy` 等） |
| `kotlin.ranges` | 范围操作（`1..10`、`downTo` 等） |
| `kotlin.sequences` | 序列操作（`sequenceOf`、`asSequence` 等） |

#### 插件不可用的 Kotlin stdlib 功能

以下 Kotlin stdlib 包**未在宿主应用中保留**，插件应避免使用，否则可能在运行时抛出 `NoSuchMethodError`：

| 包 | 替代方案 |
|------|----------|
| `kotlin.io`（如 `readBytes`、`writeText` 等文件操作） | 使用 `java.io.*` 标准库 |
| `kotlin.reflect`（如 `memberProperties`、`cast` 等反射操作） | 使用 `java.lang.reflect.*` |
| `kotlin.math`（如 `sin`、`cos` 等数学函数） | 使用 `java.lang.Math` 或 `kotlin.math.*`（需自行保留） |
| `kotlin.system`（如 `measureTimeMillis`） | 避免使用 |
| `kotlin.concurrent`（如 `Thread` 扩展函数） | 使用 `java.util.concurrent.*` |
| `kotlin.random`（如 `Random`） | 使用 `java.util.Random` |
| `kotlin.time`（如 `measureTime`、`Duration`） | 使用 `System.currentTimeMillis()` |
| `kotlinx.*`（协程、序列化等） | 如需使用请自行打包在插件 APK 中 |

#### 插件 ProGuard 规则

如果启用混淆，不需要再保留 Kotlin stdlib（由宿主应用负责），只需保留插件自身的类和入口：

```proguard
# Plugin ProGuard rules
-dontobfuscate
-optimizations !class/merging/*

# 保留插件自身代码
-keep class com.example.plugin.** { *; }
-keepattributes SourceFile,LineNumberTable
```

**推荐**：保持 `isMinifyEnabled = false`（禁用混淆），这是最简单可靠的做法。

## 插件数据结构

### EmojiItem

```kotlin
data class EmojiDisplayConfig(
    val span: Int = 1,           // 网格跨列数
    val heightDp: Int = 40,      // 自定义高度
    val aspectRatio: Float? = null // 宽高比（图片表情用）
)

data class EmojiItem(
    val id: String,              // 唯一标识
    val displayText: String,     // 显示文本
    val insertText: String,      // 插入文本
    val imageUrl: String?,       // 图片 URL（本地路径或网络 URL）
    val category: String,        // 分类名称
    val displayConfig: EmojiDisplayConfig? = null  // 显示配置（可选）
)
```

> ⚠️ **重要**：`EmojiItem` 有 6 个字段！本地定义插件 API 接口时，**必须完整包含 `displayConfig` 字段**，否则运行时宿主应用会报 `NoSuchMethodError`。这是因为宿主应用的 `EmojiItem` 已包含该字段，而插件编译时使用本地定义，运行时由宿主类加载器加载，构造函数签名必须一致。

### EmojiPlugin 接口

```kotlin
interface EmojiPlugin : IPluginEntryClass {
    override fun onLoad(context: PluginContext)
    override fun onUnload()
    
    suspend fun getEmojis(category: String?, searchText: String?, topK: Int): List<EmojiItem>
    suspend fun getCategories(): List<String>
    
    // 可选：自定义分类布局
    suspend fun getCategoryLayoutConfig(category: String): CategoryLayoutConfig? = null
    
    // 可选：插件图标
    fun getIcon(): PluginIcon? = null
    
    override fun hasSettings(): Boolean = false
    override fun openSettings(context: Context) {}
}

data class CategoryLayoutConfig(
    val columns: Int = 8,
    val itemHeightDp: Int = 40
)

data class PluginIcon(
    val text: String? = null,      // 表情符号文本（如 "🐰"）
    val assetName: String? = null  // assets 中的图标文件名（如 "icon.png"）
)
```

### PluginIcon 使用说明

插件图标有两种方式：

1. **文本图标**：`PluginIcon(text = "🐰")` — 简单可靠，推荐
2. **图片图标**：`PluginIcon(assetName = "icon.png")` — 图片放在 `assets/icon.png`

> ⚠️ **重要**：`assetName` **不能包含路径分隔符**（如 `emojis/icon.png`）！
> 宿主应用的 `ExtensionManager.extractPluginIcon()` 在提取图标时，会将 assetName 拼接为路径
> `plugin_icons/{pluginId}_{assetName}`，如果包含 `/` 会产生子目录，但宿主未创建父目录，
> 导致 `FileNotFoundException`。**请始终将图标文件放在 `assets/` 根目录，使用纯文件名**。

### PluginContext 及其他模型

```kotlin
data class PluginContext(
    val application: Application,    // 宿主 Application
    val pluginInfo: PluginInfo,      // 插件信息
    val pluginId: String = pluginInfo.id
) {
    // 注意：无 dataDir 字段，需要文件操作时使用 application.filesDir
}

data class PluginInfo(
    val id: String,                  // 插件 ID（即 applicationId）
    val name: String,
    val iconResId: Int,
    val versionCode: Long,
    val versionName: String,
    val path: String,                // 插件 APK 文件路径
    val entryClass: String,          // 入口类完整类名
    val description: String,
    val type: String = "unknown",
    val enabled: Boolean = true,
    val installTime: Long = System.currentTimeMillis(),
    val nativeLibPath: String? = null,
    val providers: List<ProviderInfo> = emptyList()
)
```

## 安装和测试

### 构建

```bash
./gradlew assembleDebug
```

### 清除插件数据（调试用）

```bash
./gradlew clearPlugins      # 清除插件文件
./gradlew uninstallApp      # 完全卸载主应用
```

### 安装顺序

```bash
# 1. 卸载旧版本
adb uninstall com.kingzcheung.xime
adb uninstall com.example.kime.plugin.myplugin

# 2. 安装新版本
adb install app/build/outputs/apk/debug/Xime-xxx.apk
adb install my-plugin/build/outputs/apk/debug/my-plugin-xxx.apk
```

## 常见问题

### 1. ClassNotFoundException 或 NoSuchMethodError

**原因**：
- 插件使用了宿主应用未保留的 Kotlin stdlib 方法（如 `kotlin.io`、`kotlin.math` 等），R8 裁剪后运行时找不到
- 插件启用了混淆导致自身类名或方法被重命名

**解决**：
1. 禁用混淆：`isMinifyEnabled = false`（推荐）
2. 检查代码是否使用了[不可用的 Kotlin stdlib 包](#宿主应用保留的-kotlin-stdlib-包)，改用 Java 标准库替代
3. 如需保留特定 Kotlin 方法，可在插件自身添加 ProGuard 规则，但需注意宿主应用不一定包含这些方法

### 2. 插件无法发现

**原因**：AndroidManifest intent-filter 配置错误

**解决**：检查 `<action android:name="com.kingzcheung.xime.plugin.EXTENSION" />`

### 3. 插件加载失败

**原因**：插件入口类路径错误

**解决**：
- 检查 `plugin.entryClass` 元数据
- 确保类名完整：`com.example.plugin.MyPlugin`

### 4. 表情数据未显示

**原因**：
- `getEmojis()` 返回空列表
- 主应用未启用插件
- 插件 APK 更新后宿主仍使用旧缓存

**解决**：
- 检查 `loadEmojis()` 实现
- 在主应用设置中启用插件
- 更新插件时务必递增 `versionCode`（见下方说明）

### 5. NoSuchMethodError（EmojiItem 构造函数不匹配）

```
java.lang.NoSuchMethodError: No direct method <init>
(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;
Ljava/lang/String;Ljava/lang/String;)V
in class Lcom/kingzcheung/xime/plugin/core/api/EmojiItem;
```

**原因**：插件本地定义的 `EmojiItem` 与宿主应用的版本不同。
宿主应用的 `EmojiItem` 包含 6 个字段（含 `displayConfig`），
如果本地只定义 5 个字段，编译时生成 5 参数构造器调用，
运行时宿主类加载器找不到匹配的构造器。

**解决**：确保本地 API 接口定义与宿主 `plugin-core` 源码一致。

```kotlin
// 正确：6 个字段
data class EmojiItem(
    val id: String,
    val displayText: String,
    val insertText: String,
    val imageUrl: String?,
    val category: String,
    val displayConfig: EmojiDisplayConfig? = null  // 别忘了这个！
)
```

### 6. 插件更新后不生效（缓存问题）

**原因**：`PluginManager` 在 `installPlugin()` 中将插件 APK 复制到
宿主数据目录（`files/plugins/{pluginId}/base.apk`）。如果 `versionCode` 未递增，
宿主认为无需更新，继续使用旧缓存。

**解决**：
- 每次更新插件时 **必须递增 `versionCode`**
- 或者先卸载再安装：`adb uninstall` + `adb install`
- 调试时可在宿主应用中清除插件数据

```bash
# 彻底重装（推荐调试用）
adb uninstall com.example.plugin.myplugin
adb install app/build/outputs/apk/debug/my-plugin.apk
# 然后重启宿主应用
```

## 现有插件示例

| 插件 | 类型 | 特点 |
|------|------|------|
| kaomoji | EMOJI | 预定义颜文字数据 |
| meme-bunny | EMOJI | 恶搞兔表情包（从 APK assets 加载） |

## 参考文档

- [plugin-core 源码](https://github.com/ximeiorg/Xime/tree/main/plugin-core) - 核心实现
- [现有插件实现](https://github.com/ximeiorg/Xime/tree/main/plugins) - 学习最佳实践

## 版本兼容

- 插件 compileSdk 应与主应用一致（36）
- 插件 targetSdk 应 ≥ 主应用 minSdk（28）
- Kotlin 版本应与主应用一致（2.3.20）