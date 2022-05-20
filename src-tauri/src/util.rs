pub fn find_port(start_port: u16, end_port: u16) -> u16 {
  for x in start_port..end_port {
    if portpicker::is_free(x) {
      return x;
    }
  }

  panic!("No open port found between: [{:?}, {:?}]", start_port, end_port);
}

