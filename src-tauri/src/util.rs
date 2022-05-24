use sysinfo::{ProcessExt, System, SystemExt, Signal};

pub fn find_port(start_port: u16, end_port: u16) -> u16 {
  for x in start_port..end_port {
    if portpicker::is_free(x) {
      return x;
    }
  }

  panic!("No open port found between: [{:?}, {:?}]", start_port, end_port);
}

pub fn find_and_kill_processes(name: &str) {
  let processes = System::new_all();

  for process in processes.processes_by_exact_name(name) {
      log::info!("Prosses running: {} {}", process.pid(), process.name());
      
      match process.kill_with(Signal::Term) {
        None => {
          log::error!("This signal isn't supported on this platform");
        },
        _ => {}
     }
  }
}
