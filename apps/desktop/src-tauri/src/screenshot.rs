use tauri::Manager;
use serde::Serialize;
use std::io::Cursor;

#[derive(Serialize)]
pub struct ScreenshotResult {
    /// Base64-encoded PNG image
    pub base64: String,
    pub width: u32,
    pub height: u32,
}

/// 截取主屏幕的截图，返回 base64 PNG
#[tauri::command]
pub async fn capture_screen() -> Result<ScreenshotResult, String> {
    // 使用 xcap 库截取屏幕
    let screens = xcap::Monitor::all().map_err(|e| format!("获取屏幕失败: {}", e))?;

    let primary = screens
        .into_iter()
        .find(|m| m.is_primary())
        .or_else(|| xcap::Monitor::all().ok()?.into_iter().next())
        .ok_or("找不到显示器".to_string())?;

    let image = primary
        .capture_image()
        .map_err(|e| format!("截屏失败: {}", e))?;

    let width = image.width();
    let height = image.height();

    // 编码为 PNG
    let mut buf = Cursor::new(Vec::new());
    image
        .write_to(&mut buf, image::ImageFormat::Png)
        .map_err(|e| format!("PNG 编码失败: {}", e))?;

    let base64 = base64_encode(buf.into_inner());

    Ok(ScreenshotResult {
        base64,
        width,
        height,
    })
}

/// 截取指定区域
#[tauri::command]
pub async fn capture_region(x: i32, y: i32, w: u32, h: u32) -> Result<ScreenshotResult, String> {
    let screens = xcap::Monitor::all().map_err(|e| format!("获取屏幕失败: {}", e))?;

    let primary = screens
        .into_iter()
        .find(|m| m.is_primary())
        .or_else(|| xcap::Monitor::all().ok()?.into_iter().next())
        .ok_or("找不到显示器".to_string())?;

    let full_image = primary
        .capture_image()
        .map_err(|e| format!("截屏失败: {}", e))?;

    // Crop region
    let cropped = image::imageops::crop_imm(
        &full_image,
        x.max(0) as u32,
        y.max(0) as u32,
        w.min(full_image.width()),
        h.min(full_image.height()),
    )
    .to_image();

    let mut buf = Cursor::new(Vec::new());
    image::DynamicImage::ImageRgba8(cropped)
        .write_to(&mut buf, image::ImageFormat::Png)
        .map_err(|e| format!("PNG 编码失败: {}", e))?;

    let base64 = base64_encode(buf.into_inner());

    Ok(ScreenshotResult {
        base64,
        width: w,
        height: h,
    })
}

fn base64_encode(data: Vec<u8>) -> String {
    use base64::Engine;
    base64::engine::general_purpose::STANDARD.encode(&data)
}
