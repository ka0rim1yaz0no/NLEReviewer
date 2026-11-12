param(
  [Parameter(Mandatory)][string]$Gradle,
  [Parameter(Mandatory)][string]$Java,
  [Parameter(Mandatory)][string]$Sdk,
  [int]$Version = 2
)

$ErrorActionPreference = 'Stop'
$site = 'nlereviewer.vercel.app'
$appId = 'app.vercel.nlereviewer'
$project = Join-Path $PSScriptRoot 'outputs/android-native'
$resources = Join-Path $project 'src/main/res'
$javaSources = Join-Path $project 'src/main/java/app/vercel/nlereviewer'
New-Item -ItemType Directory -Force -Path $javaSources | Out-Null
foreach ($folder in @('drawable-nodpi', 'values')) {
  New-Item -ItemType Directory -Force -Path (Join-Path $resources $folder) | Out-Null
}
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'public/play-icon-512.png') -Destination (Join-Path $resources 'drawable-nodpi/launcher.png')

@'
pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }
dependencyResolutionManagement { repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS); repositories { google(); mavenCentral() } }
rootProject.name = 'NLEReviewer'
'@ | Set-Content -LiteralPath (Join-Path $project 'settings.gradle') -Encoding ascii

@"
plugins { id 'com.android.application' version '8.13.0' }
android {
    namespace '$appId'
    compileSdk 36
    defaultConfig {
        applicationId '$appId'
        minSdk 26
        targetSdk 35
        versionCode $Version
        versionName '1.0.$Version'
    }
}
dependencies { implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.7.3' }
"@ | Set-Content -LiteralPath (Join-Path $project 'build.gradle') -Encoding ascii
'android.useAndroidX=true' | Set-Content -LiteralPath (Join-Path $project 'gradle.properties') -Encoding ascii
"sdk.dir=$($Sdk.Replace('\','/'))" | Set-Content -LiteralPath (Join-Path $project 'local.properties') -Encoding ascii

@"
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <application android:label="NLEReviewer" android:icon="@drawable/launcher"
        android:allowBackup="false" android:usesCleartextTraffic="false"
        android:manageSpaceActivity="com.google.androidbrowserhelper.trusted.ManageDataLauncherActivity"
        android:theme="@android:style/Theme.Translucent.NoTitleBar">
        <meta-data android:name="asset_statements" android:resource="@string/asset_statements" />
        <activity android:name=".ReviewerActivity"
            android:exported="true">
            <meta-data android:name="android.support.customtabs.trusted.DEFAULT_URL" android:value="https://$site/" />
            <meta-data android:name="android.support.customtabs.trusted.STATUS_BAR_COLOR" android:resource="@color/light_pink" />
            <meta-data android:name="android.support.customtabs.trusted.NAVIGATION_BAR_COLOR" android:resource="@color/light_pink" />
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="$site" />
            </intent-filter>
        </activity>
        <!-- LauncherActivity enables this component when the browser supports site settings. -->
        <activity android:name="com.google.androidbrowserhelper.trusted.ManageDataLauncherActivity"
            android:exported="false" android:excludeFromRecents="true">
            <meta-data android:name="android.support.customtabs.trusted.MANAGE_SPACE_URL" android:value="https://$site/" />
        </activity>
        <activity android:name="com.google.androidbrowserhelper.trusted.FocusActivity" android:exported="false" />
        <!-- Chrome opens this private activity to request the app's Android 13+ notification permission. -->
        <activity android:name="com.google.androidbrowserhelper.trusted.NotificationPermissionRequestActivity"
            android:exported="false" />
        <service android:name="com.google.androidbrowserhelper.trusted.DelegationService" android:exported="true">
            <intent-filter>
                <action android:name="android.support.customtabs.trusted.TRUSTED_WEB_ACTIVITY_SERVICE" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </service>
    </application>
</manifest>
"@ | Set-Content -LiteralPath (Join-Path $project 'src/main/AndroidManifest.xml') -Encoding ascii

@"
<resources>
    <color name="light_pink">#FEB5C0</color>
    <string name="asset_statements" translatable="false">[{\"relation\":[\"delegate_permission/common.handle_all_urls\"],\"target\":{\"namespace\":\"web\",\"site\":\"https://$site\"}}]</string>
</resources>
"@ | Set-Content -LiteralPath (Join-Path $resources 'values/app.xml') -Encoding ascii

@"
package $appId;

import android.content.Intent;
import android.net.Uri;
import com.google.androidbrowserhelper.trusted.LauncherActivity;

public final class ReviewerActivity extends LauncherActivity {
    @Override
    protected Uri getUrlForIntent(Intent intent) {
        Uri url = super.getUrlForIntent(intent);
        if (url == null || !"https".equals(url.getScheme()) || !"$site".equals(url.getHost())
                || url.getUserInfo() != null || (url.getPort() != -1 && url.getPort() != 443)) {
            return null;
        }
        return url;
    }
}
"@ | Set-Content -LiteralPath (Join-Path $javaSources 'ReviewerActivity.java') -Encoding ascii

$env:JAVA_HOME = $Java
$env:ANDROID_HOME = $Sdk
& $Gradle -p $project --console=plain assembleRelease
if ($LASTEXITCODE -ne 0) { throw 'Android build failed.' }

$keys = Join-Path $env:LOCALAPPDATA 'NLEReviewer/signing'
New-Item -ItemType Directory -Force -Path $keys | Out-Null
$keystore = Join-Path $keys 'release.p12'
$passwordFile = Join-Path $keys 'release-password.txt'
if (!(Test-Path -LiteralPath $keystore) -and !(Test-Path -LiteralPath $passwordFile)) {
  [guid]::NewGuid().ToString('N') | Set-Content -LiteralPath $passwordFile -Encoding ascii
  & (Join-Path $Java 'bin/keytool.exe') -genkeypair -keystore $keystore -storetype PKCS12 -storepass:file $passwordFile -alias reviewer -keyalg RSA -keysize 3072 -validity 10000 -dname 'CN=NLEReviewer'
  if ($LASTEXITCODE -ne 0) { throw 'Android signing key generation failed.' }
}
if (!(Test-Path -LiteralPath $keystore) -or !(Test-Path -LiteralPath $passwordFile)) { throw 'Restore the existing Android signing files before publishing an update.' }

$signer = Join-Path $Sdk 'build-tools/36.0.0/apksigner.bat'
$apk = Join-Path $PSScriptRoot 'nlereviewer.apk'
& $signer sign --ks $keystore --ks-pass "file:$passwordFile" --ks-key-alias reviewer --v4-signing-enabled false --out $apk (Join-Path $project 'build/outputs/apk/release/NLEReviewer-release-unsigned.apk')
if ($LASTEXITCODE -ne 0) { throw 'APK signing failed.' }
$verification = & $signer verify --verbose --print-certs $apk
if ($LASTEXITCODE -ne 0) { throw 'APK signature verification failed.' }
$hash = [regex]::Match(($verification -join "`n"), 'certificate SHA-256 digest: ([a-fA-F0-9]{64})').Groups[1].Value.ToUpperInvariant()
if ($hash.Length -ne 64) { throw 'The APK certificate fingerprint is unavailable.' }
$fingerprint = ([regex]::Matches($hash, '..').Value -join ':')
$metadata = [ordered]@{ package = $appId; certificate = $fingerprint; sha256 = (Get-FileHash -LiteralPath $apk -Algorithm SHA256).Hash.ToLowerInvariant() }
$metadata | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'android-package.json') -Encoding ascii
Write-Output "Signed NLEReviewer Android APK ($(Get-Item -LiteralPath $apk | Select-Object -ExpandProperty Length) bytes)."
