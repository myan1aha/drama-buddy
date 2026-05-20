use tauri::Manager;

mod screenshot;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            screenshot::capture_screen,
            screenshot::capture_region,
        ])
        .setup(|app| {
            // 获取主窗口并配置
            if let Some(window) = app.get_webview_window("main") {
                // macOS 下设置透明标题栏
                #[cfg(target_os = "macos")]
                {
                    use tauri::TitleBarStyle;
                    let _ = window.set_title_bar_style(TitleBarStyle::Overlay);
                }

                // 设置窗口阴影
                let _ = window.set_shadow(true);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
