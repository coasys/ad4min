use tauri::{Menu, Submenu, MenuItem};

pub fn build_menu() -> Menu {
    let edit_menu = Submenu::new(
        "Edit",
        Menu::new()
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste)
            .add_native_item(MenuItem::SelectAll),
    );

    Menu::new().add_submenu(edit_menu)
}
