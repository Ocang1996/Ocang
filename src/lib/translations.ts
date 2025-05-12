// Translations for the application
// This file contains all text that should be translated

type TranslationKeys = {
  // Common
  app_name: string;
  loading: string;
  submit: string;
  cancel: string;
  save: string;
  close: string;
  back: string;
  next: string;
  search: string;
  filter: string;
  view_all: string;
  view_details: string;
  more_info: string;
  notifications: string;
  profile: string;
  settings: string;
  
  // Auth
  login: string;
  logout: string;
  register: string;
  username: string;
  password: string;
  forgot_password: string;
  remember_me: string;
  verification: string;
  demo_mode: string;
  login_demo_message: string;
  login_message: string;
  demo_credentials: string;
  no_account: string;
  
  // Navigation
  nav_dashboard: string;
  nav_employees: string;
  nav_reports: string;
  nav_leave: string;
  nav_profile: string;
  nav_settings: string;
  nav_help: string;
  
  // Dashboard
  dashboard_title: string;
  dashboard_summary: string;
  tab_overview: string;
  tab_employment: string;
  tab_retirement: string;
  total_employees: string;
  new_employees: string;
  active_employees: string;
  retired_employees: string;
  total_departments: string;
  pending_approvals: string;
  retirement_soon: string;
  total_positions: string;
  data_employment: string;
  retirement_prediction: string;
  
  // Employee List Page
  employee_list_title: string;
  employee_list_description: string;
  employee_list_search: string;
  employee_list_add: string;
  employee_list_export: string;
  employee_name: string;
  employee_id: string;
  employee_position: string;
  employee_department: string;
  employee_rank: string;
  employee_status: string;
  employee_actions: string;
  all_departments: string;
  all_statuses: string;
  employee_list: string;
  search_placeholder: string;
  department: string;
  status: string;
  add_employee: string;
  edit_employee: string;
  export: string;
  exporting: string;
  export_to_pdf: string;
  export_to_excel: string;
  export_to_csv: string;
  export_to_word: string;
  actions: string;
  showing: string;
  to: string;
  of: string;
  employees: string;
  previous: string;
  no_employees_found: string;
  synchronized: string;
  sync_failed: string;
  sync: string;
  syncing: string;
  table_view: string;
  card_view: string;
  employee_count: string;
  
  // Reports Page
  reports_title: string;
  reports_description: string;
  reports_available: string;
  employee_distribution: string;
  employee_distribution_desc: string;
  employee_growth: string;
  employee_growth_desc: string;
  rank_distribution: string;
  rank_distribution_desc: string;
  performance_report: string;
  performance_report_desc: string;
  download_report: string;
  load_data: string;
  period: string;
  compared_prev_period: string;
  total_asn: string;
  growth: string;
  highest_rank_ratio: string;
  yearly: string;
  quarterly: string;
  monthly: string;
  chart_visualization_will_be_shown: string;
  demographic_report: string;
  demographic_report_desc: string;
  demographic_data_summary: string;
  highest_rank: string;
  highest_education: string;
  highest_class: string;
  largest_unit: string;
  gender_distribution: string;
  new_employees_this_month: string;
  of_total_employees: string;
  total: string;
  male: string;
  female: string;
  
  // Report Download Section
  available_reports: string;
  download_demographic_report: string;
  download_demographic_description: string;
  select_report_type: string;
  add_report_type: string;
  file_format: string;
  download_report_btn: string;
  last_updated: string;
  report_info: string;
  realtime_data: string;
  various_formats: string;
  combine_reports: string;
  image_formats: string;
  select_format: string;
  select_report: string;
  select_format_pdf: string;
  select_format_xlsx: string;
  select_format_csv: string;
  select_format_docx: string;
  select_format_jpg: string;
  select_format_png: string;
  
  // Profile Page
  profile_title: string;
  profile_description: string;
  profile_info: string;
  edit_profile: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  birth_date: string;
  join_date: string;
  role: string;
  change_password: string;
  save_changes: string;
  cancel_edit: string;
  confirm_password: string;
  current_password: string;
  new_password: string;
  
  // Charts
  chart_position_distribution: string;
  chart_education_level: string;
  chart_rank_distribution: string;
  chart_employment_status: string;
  chart_age_distribution: string;
  chart_gender_distribution: string;
  chart_years_of_service: string;
  
  // Settings
  settings_title: string;
  settings_appearance: string;
  settings_language: string;
  settings_theme: string;
  settings_theme_light: string;
  settings_theme_dark: string;
  settings_theme_system: string;
  settings_font_size: string;
  settings_font_small: string;
  settings_font_medium: string;
  settings_font_large: string;
  settings_notifications: string;
  settings_account: string;
  settings_privacy: string;
  settings_help: string;
  settings_adjust_preference: string;
  settings_title_notification: string;
  settings_appearance_instruction: string;
  settings_storage: string;
  
  // Education levels
  education_elementary: string;
  education_junior_high: string;
  education_high_school: string;
  education_diploma: string;
  education_undergraduate: string;
  education_masters: string;
  education_doctorate: string;
  education_summary: string;
  
  // Employment positions
  position_title: string;
  position_summary: string;
  
  // Employees
  employee_education: string;
  employee_join_date: string;
  
  // Profile
  profile_personal_info: string;
  profile_contact_info: string;
  profile_employment_info: string;
  profile_education_info: string;
  profile_settings: string;
  
  // Messages
  success_save: string;
  error_general: string;
  confirm_delete: string;
  no_data: string;
  loading_data: string;
  please_wait: string;
  rising: string;
  try_again: string;
  no_employees_data_for_export: string;
  
  // User Management
  user_management: string;
  user_management_desc: string;
  add_user: string;
  edit_user: string;
  delete_user: string;
  user_name: string;
  user_username: string;
  user_email: string;
  user_role: string;
  user_created: string;
  user_last_login: string;
  user_actions: string;
  search_users: string;
  no_users_found: string;
  loading_users: string;
  user_added: string;
  user_updated: string;
  user_deleted: string;
  cannot_delete_own_account: string;
  cannot_delete_admin: string;
  confirm_delete_user: string;
  user_role_admin: string;
  user_role_superadmin: string;
  user_role_user: string;
  access_denied: string;
  access_denied_message: string;

  // Leave Management
  leave_management: string;
  leave_title: string;
  leave_description: string;
  leave_employee_name: string;
  leave_type: string;
  leave_duration: string;
  leave_allocation: string;
  leave_balance: string;
  leave_period: string;
  leave_status: string;
  leave_reason: string;
  leave_dates: string;
  leave_start_date: string;
  leave_end_date: string;
  leave_request: string;
  leave_add: string;
  leave_edit: string;
  leave_delete: string;
  leave_approve: string;
  leave_reject: string;
  leave_cancel: string;
  leave_detail: string;
  leave_history: string;
  leave_quota: string;
  leave_working_days: string;
  leave_holidays: string;
  leave_weekends: string;
  leave_non_working_days: string;
  leave_annual: string;
  leave_big: string;
  leave_sick: string;
  leave_maternity: string;
  leave_important_reason: string;
  leave_unpaid: string;
  leave_collective: string;
  leave_details_title: string;
  leave_employee_info: string;
  leave_info: string;
  leave_nip: string;
  leave_remaining: string;
  leave_used: string;
  leave_from_previous_year: string;
  leave_total_available: string;
  leave_system_info: string;
  leave_created_at: string;
  leave_updated_at: string;
  leave_created_by: string;
  leave_summary: string;
  leave_action_view: string;
  leave_add_form_title: string;
  leave_workday_count: string;
  leave_apply: string;
};

type Translations = {
  id: TranslationKeys;
  en: TranslationKeys;
};

const translations: Translations = {
  id: {
    // Common
    app_name: 'Dashboard Pegawai',
    loading: 'Memuat...',
    submit: 'Kirim',
    cancel: 'Batal',
    save: 'Simpan',
    close: 'Tutup',
    back: 'Kembali',
    next: 'Lanjut',
    search: 'Cari',
    filter: 'Filter',
    view_all: 'Lihat Semua',
    view_details: 'Lihat Detail',
    more_info: 'Informasi Lainnya',
    notifications: 'Notifikasi',
    profile: 'Profil',
    settings: 'Pengaturan',
    
    // Auth
    login: 'Masuk',
    logout: 'Keluar',
    register: 'Daftar',
    username: 'Nama Pengguna',
    password: 'Kata Sandi',
    forgot_password: 'Lupa Kata Sandi?',
    remember_me: 'Ingat Saya',
    verification: 'Verifikasi',
    demo_mode: 'Mode Demo',
    login_demo_message: 'Gunakan kredensial yang tertera di bawah untuk login. Server backend tidak aktif.',
    login_message: 'Silahkan login untuk melanjutkan',
    demo_credentials: 'Kredensial demo',
    no_account: 'Belum punya akun',
    
    // Navigation
    nav_dashboard: 'Dashboard',
    nav_employees: 'Daftar Pegawai',
    nav_reports: 'Laporan',
    nav_leave: 'Cuti Pegawai',
    nav_profile: 'Profil',
    nav_settings: 'Pengaturan',
    nav_help: 'Bantuan',
    
    // Dashboard
    dashboard_title: 'Dashboard Pegawai',
    dashboard_summary: 'Ringkasan data kepegawaian',
    tab_overview: 'Ikhtisar',
    tab_employment: 'Kepegawaian',
    tab_retirement: 'Prediksi Pensiun',
    total_employees: 'Total Pegawai',
    new_employees: 'Pegawai Baru',
    active_employees: 'Pegawai Aktif',
    retired_employees: 'Pegawai Pensiun',
    total_departments: 'Total Unit Kerja',
    pending_approvals: 'Menunggu Persetujuan',
    retirement_soon: 'Pegawai Akan Pensiun',
    total_positions: 'Total Jabatan',
    data_employment: 'Data Kepegawaian',
    retirement_prediction: 'Prediksi Pensiun',
    
    // Employee List Page
    employee_list_title: 'Daftar Pegawai',
    employee_list_description: 'Kelola data pegawai',
    employee_list_search: 'Cari pegawai...',
    employee_list_add: 'Tambah Pegawai',
    employee_list_export: 'Ekspor Data',
    employee_name: 'Nama Pegawai',
    employee_id: 'NIP',
    employee_position: 'Jabatan',
    employee_department: 'Unit Kerja',
    employee_rank: 'Golongan',
    employee_status: 'Status',
    employee_actions: 'Aksi',
    all_departments: 'Semua Unit Kerja',
    all_statuses: 'Semua Status',
    employee_list: 'Daftar Pegawai',
    search_placeholder: 'Cari pegawai...',
    department: 'Unit Kerja',
    status: 'Status',
    add_employee: 'Tambah Pegawai',
    edit_employee: 'Edit Pegawai',
    export: 'Ekspor',
    exporting: 'Mengekspor...',
    export_to_pdf: 'Ekspor ke PDF',
    export_to_excel: 'Ekspor ke Excel',
    export_to_csv: 'Ekspor ke CSV',
    export_to_word: 'Ekspor ke Word',
    actions: 'Aksi',
    showing: 'Menampilkan',
    to: 'sampai',
    of: 'dari',
    employees: 'pegawai',
    previous: 'Sebelumnya',
    no_employees_found: 'Tidak ada pegawai yang ditemukan',
    synchronized: 'Tersinkronisasi',
    sync_failed: 'Gagal sinkronisasi',
    sync: 'Sinkronisasi',
    syncing: 'Sinkronisasi...',
    table_view: 'Tampilan Tabel',
    card_view: 'Tampilan Kartu',
    employee_count: 'Jumlah Pegawai',
    
    // Reports Page
    reports_title: 'Laporan',
    reports_description: 'Buat dan ekspor laporan berdasarkan data pegawai',
    reports_available: 'Laporan Tersedia',
    employee_distribution: 'Distribusi Pegawai',
    employee_distribution_desc: 'Distribusi pegawai berdasarkan berbagai kategori',
    employee_growth: 'Pertumbuhan Pegawai',
    employee_growth_desc: 'Pertumbuhan pegawai seiring waktu',
    rank_distribution: 'Distribusi Golongan',
    rank_distribution_desc: 'Distribusi pegawai berdasarkan golongan',
    performance_report: 'Laporan Kinerja',
    performance_report_desc: 'Tinjauan kinerja pegawai',
    download_report: 'Unduh Laporan',
    load_data: 'Muat Data',
    period: 'Periode',
    compared_prev_period: 'Dibandingkan dengan Periode Sebelumnya',
    total_asn: 'Total ASN',
    growth: 'Pertumbuhan',
    highest_rank_ratio: 'Rasio Golongan Tertinggi',
    yearly: 'Tahunan',
    quarterly: 'Kuartalan',
    monthly: 'Bulanan',
    chart_visualization_will_be_shown: 'Visualisasi Grafik akan Ditampilkan di Sini',
    demographic_report: 'Laporan Demografi',
    demographic_report_desc: 'Tinjauan demografi pegawai',
    demographic_data_summary: 'Ringkasan Data Demografi',
    highest_rank: 'Golongan Tertinggi',
    highest_education: 'Pendidikan Tertinggi',
    highest_class: 'Golongan Tertinggi',
    largest_unit: 'Unit Terbesar',
    gender_distribution: 'Distribusi Gender',
    new_employees_this_month: 'Pegawai Baru Bulan Ini',
    of_total_employees: 'dari Total Pegawai',
    total: 'Total',
    male: 'Laki-laki',
    female: 'Perempuan',
    
    // Report Download Section
    available_reports: 'Laporan Tersedia',
    download_demographic_report: 'Unduh Laporan Demografi',
    download_demographic_description: 'Unduh data demografi komprehensif dari semua pegawai',
    select_report_type: 'Pilih Tipe Laporan',
    add_report_type: 'Tambah Tipe Laporan',
    file_format: 'Format File',
    download_report_btn: 'Unduh Laporan',
    last_updated: 'Terakhir Diperbarui',
    report_info: 'Informasi Laporan',
    realtime_data: 'Data Riil-Waktu',
    various_formats: 'Berbagai Format',
    combine_reports: 'Gabungkan Laporan',
    image_formats: 'Format Gambar',
    select_format: 'Pilih Format',
    select_report: 'Pilih Laporan',
    select_format_pdf: 'PDF',
    select_format_xlsx: 'Excel',
    select_format_csv: 'CSV',
    select_format_docx: 'Word',
    select_format_jpg: 'JPG',
    select_format_png: 'PNG',
    
    // Profile Page
    profile_title: 'Profil Pegawai',
    profile_description: 'Kelola informasi profil pegawai',
    profile_info: 'Informasi Profil',
    edit_profile: 'Edit Profil',
    full_name: 'Nama Lengkap',
    email: 'Email',
    phone: 'Telepon',
    address: 'Alamat',
    birth_date: 'Tanggal Lahir',
    join_date: 'Tanggal Bergabung',
    role: 'Jabatan',
    change_password: 'Ubah Kata Sandi',
    save_changes: 'Simpan Perubahan',
    cancel_edit: 'Batal Edit',
    confirm_password: 'Konfirmasi Kata Sandi',
    current_password: 'Kata Sandi Saat Ini',
    new_password: 'Kata Sandi Baru',
    
    // Charts
    chart_position_distribution: 'Distribusi Jabatan',
    chart_education_level: 'Distribusi Tingkat Pendidikan',
    chart_rank_distribution: 'Distribusi Golongan',
    chart_employment_status: 'Distribusi Status Kepegawaian',
    chart_age_distribution: 'Distribusi Usia',
    chart_gender_distribution: 'Distribusi Gender',
    chart_years_of_service: 'Distribusi Lama Bekerja',
    
    // Settings
    settings_title: 'Pengaturan',
    settings_appearance: 'Penampilan',
    settings_language: 'Bahasa',
    settings_theme: 'Tema',
    settings_theme_light: 'Terang',
    settings_theme_dark: 'Gelap',
    settings_theme_system: 'Sistem',
    settings_font_size: 'Ukuran Huruf',
    settings_font_small: 'Kecil',
    settings_font_medium: 'Sedang',
    settings_font_large: 'Besar',
    settings_notifications: 'Notifikasi',
    settings_account: 'Akun',
    settings_privacy: 'Privasi',
    settings_help: 'Bantuan',
    settings_adjust_preference: 'Sesuaikan tampilan aplikasi sesuai preferensi Anda.',
    settings_title_notification: 'Pengaturan Notifikasi',
    settings_appearance_instruction: 'Sesuaikan pengaturan tampilan untuk dashboard Anda',
    settings_storage: 'Penyimpanan',
    
    // Education levels
    education_elementary: 'SD',
    education_junior_high: 'SMP',
    education_high_school: 'SMA/SMK',
    education_diploma: 'Diploma',
    education_undergraduate: 'S1',
    education_masters: 'S2',
    education_doctorate: 'S3',
    education_summary: 'Ringkasan Pendidikan',
    
    // Employment positions
    position_title: 'Jabatan',
    position_summary: 'Ringkasan Jabatan',
    
    // Employees
    employee_education: 'Pendidikan',
    employee_join_date: 'Tanggal Masuk',
    
    // Profile
    profile_personal_info: 'Informasi Pribadi',
    profile_contact_info: 'Informasi Kontak',
    profile_employment_info: 'Informasi Kepegawaian',
    profile_education_info: 'Informasi Pendidikan',
    profile_settings: 'Pengaturan Profil',
    
    // Messages
    success_save: 'Berhasil disimpan',
    error_general: 'Terjadi kesalahan',
    confirm_delete: 'Konfirmasi penghapusan',
    no_data: 'Tidak ada data',
    loading_data: 'Memuat data...',
    please_wait: 'Silakan tunggu sementara kami menyiapkan visualisasi laporan.',
    rising: 'Naik',
    try_again: 'Coba Lagi',
    no_employees_data_for_export: 'Tidak ada data pegawai untuk diekspor',
    
    // User Management
    user_management: 'Manajemen Pengguna',
    user_management_desc: 'Kelola pengguna dan akses aplikasi',
    add_user: 'Tambah Pengguna',
    edit_user: 'Edit Pengguna',
    delete_user: 'Hapus Pengguna',
    user_name: 'Nama Pengguna',
    user_username: 'Username',
    user_email: 'Email',
    user_role: 'Role',
    user_created: 'Terdaftar',
    user_last_login: 'Login Terakhir',
    user_actions: 'Aksi',
    search_users: 'Cari pengguna...',
    no_users_found: 'Tidak ada pengguna yang ditemukan',
    loading_users: 'Memuat data pengguna...',
    user_added: 'Pengguna berhasil ditambahkan',
    user_updated: 'Pengguna berhasil diperbarui',
    user_deleted: 'Pengguna berhasil dihapus',
    cannot_delete_own_account: 'Anda tidak dapat menghapus akun yang sedang digunakan',
    cannot_delete_admin: 'Anda tidak memiliki izin untuk menghapus admin atau superadmin',
    confirm_delete_user: 'Apakah Anda yakin ingin menghapus pengguna',
    user_role_admin: 'Admin',
    user_role_superadmin: 'Super Admin',
    user_role_user: 'User',
    access_denied: 'Akses Ditolak',
    access_denied_message: 'Anda tidak memiliki izin untuk mengakses halaman ini. Hanya admin dan superadmin yang dapat mengelola pengguna.',
    
    // Leave Management
    leave_management: 'Manajemen Cuti',
    leave_title: 'Cuti Pegawai',
    leave_description: 'Kelola pengajuan cuti pegawai',
    leave_employee_name: 'Nama Pegawai',
    leave_type: 'Jenis Cuti',
    leave_duration: 'Durasi',
    leave_allocation: 'Alokasi Total',
    leave_balance: 'Sisa',
    leave_period: 'Periode',
    leave_status: 'Status',
    leave_reason: 'Alasan Cuti',
    leave_dates: 'Tanggal Cuti',
    leave_start_date: 'Tanggal Mulai',
    leave_end_date: 'Tanggal Selesai',
    leave_request: 'Pengajuan Cuti',
    leave_add: 'Tambah Cuti',
    leave_edit: 'Edit Cuti',
    leave_delete: 'Hapus Cuti',
    leave_approve: 'Setujui',
    leave_reject: 'Tolak',
    leave_cancel: 'Batalkan',
    leave_detail: 'Detail Cuti',
    leave_history: 'Riwayat Cuti',
    leave_quota: 'Kuota Cuti',
    leave_working_days: 'Hari Kerja',
    leave_holidays: 'Hari Libur',
    leave_weekends: 'Akhir Pekan',
    leave_non_working_days: 'Hari Tidak Bekerja',
    leave_annual: 'Tahunan',
    leave_big: 'Besar',
    leave_sick: 'Sakit',
    leave_maternity: 'Melahirkan',
    leave_important_reason: 'Alasan Penting',
    leave_unpaid: 'Di Luar Tanggungan Negara',
    leave_collective: 'Cuti Bersama',
    leave_details_title: 'Detail Cuti Pegawai',
    leave_employee_info: 'Informasi Pegawai',
    leave_info: 'Informasi Cuti',
    leave_nip: 'NIP/ID Pegawai',
    leave_remaining: 'Sisa Cuti',
    leave_used: 'Digunakan',
    leave_from_previous_year: 'Dari Tahun Sebelumnya',
    leave_total_available: 'Total Sisa Cuti',
    leave_system_info: 'Informasi Sistem',
    leave_created_at: 'Dibuat pada',
    leave_updated_at: 'Terakhir diperbarui',
    leave_created_by: 'Diinput oleh',
    leave_summary: 'Ringkasan Semua Jenis Cuti',
    leave_action_view: 'Lihat Detail',
    leave_add_form_title: 'Tambah Data Cuti',
    leave_workday_count: 'Jumlah Hari Kerja',
    leave_apply: 'Ajukan Cuti',
  },
  en: {
    // Common
    app_name: 'Employee Dashboard',
    loading: 'Loading...',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    search: 'Search',
    filter: 'Filter',
    view_all: 'View All',
    view_details: 'View Details',
    more_info: 'More Info',
    notifications: 'Notifications',
    profile: 'Profile',
    settings: 'Settings',
    
    // Auth
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    forgot_password: 'Forgot Password?',
    remember_me: 'Remember Me',
    verification: 'Verification',
    demo_mode: 'Demo Mode',
    login_demo_message: 'Use the credentials listed below to log in. Backend server is not active.',
    login_message: 'Please log in to continue',
    demo_credentials: 'Demo credentials',
    no_account: 'Don\'t have an account',
    
    // Navigation
    nav_dashboard: 'Dashboard',
    nav_employees: 'Employee List',
    nav_reports: 'Reports',
    nav_leave: 'Employee Leave',
    nav_profile: 'Profile',
    nav_settings: 'Settings',
    nav_help: 'Help',
    
    // Dashboard
    dashboard_title: 'Employee Dashboard',
    dashboard_summary: 'Employee data summary',
    tab_overview: 'Overview',
    tab_employment: 'Employment',
    tab_retirement: 'Retirement Prediction',
    total_employees: 'Total Employees',
    new_employees: 'New Employees',
    active_employees: 'Active Employees',
    retired_employees: 'Retired Employees',
    total_departments: 'Total Departments',
    pending_approvals: 'Pending Approvals',
    retirement_soon: 'Upcoming Retirements',
    total_positions: 'Total Positions',
    data_employment: 'Employment Data',
    retirement_prediction: 'Retirement Prediction',
    
    // Employee List Page
    employee_list_title: 'Employee List',
    employee_list_description: 'Manage employee data',
    employee_list_search: 'Search employees...',
    employee_list_add: 'Add Employee',
    employee_list_export: 'Export Data',
    employee_name: 'Employee Name',
    employee_id: 'Employee ID',
    employee_position: 'Position',
    employee_department: 'Department',
    employee_rank: 'Rank',
    employee_status: 'Status',
    employee_actions: 'Actions',
    all_departments: 'All Departments',
    all_statuses: 'All Statuses',
    employee_list: 'Employee List',
    search_placeholder: 'Search employees...',
    department: 'Department',
    status: 'Status',
    add_employee: 'Add Employee',
    edit_employee: 'Edit Employee',
    export: 'Export',
    exporting: 'Exporting...',
    export_to_pdf: 'Export to PDF',
    export_to_excel: 'Export to Excel',
    export_to_csv: 'Export to CSV',
    export_to_word: 'Export to Word',
    actions: 'Actions',
    showing: 'Showing',
    to: 'to',
    of: 'of',
    employees: 'employees',
    previous: 'Previous',
    no_employees_found: 'No employees found',
    synchronized: 'Synchronized',
    sync_failed: 'Sync failed',
    sync: 'Sync',
    syncing: 'Syncing...',
    table_view: 'Table View',
    card_view: 'Card View',
    employee_count: 'Employee Count',
    
    // Reports Page
    reports_title: 'Reports',
    reports_description: 'Create and export reports based on employee data',
    reports_available: 'Available Reports',
    employee_distribution: 'Employee Distribution',
    employee_distribution_desc: 'Distribution of employees by various categories',
    employee_growth: 'Employee Growth',
    employee_growth_desc: 'Employee growth over time',
    rank_distribution: 'Rank Distribution',
    rank_distribution_desc: 'Distribution of employees by rank',
    performance_report: 'Performance Report',
    performance_report_desc: 'Employee performance overview',
    download_report: 'Download Report',
    load_data: 'Load Data',
    period: 'Period',
    compared_prev_period: 'Compared to Previous Period',
    total_asn: 'Total ASN',
    growth: 'Growth',
    highest_rank_ratio: 'Highest Rank Ratio',
    yearly: 'Yearly',
    quarterly: 'Quarterly',
    monthly: 'Monthly',
    chart_visualization_will_be_shown: 'Chart visualization will be shown here',
    demographic_report: 'Demographic Report',
    demographic_report_desc: 'Employee demographics overview',
    demographic_data_summary: 'Demographic Data Summary',
    highest_rank: 'Highest Rank',
    highest_education: 'Highest Education',
    highest_class: 'Highest Class',
    largest_unit: 'Largest Unit',
    gender_distribution: 'Gender Distribution',
    new_employees_this_month: 'New Employees This Month',
    of_total_employees: 'of Total Employees',
    total: 'Total',
    male: 'Male',
    female: 'Female',
    
    // Report Download Section
    available_reports: 'Available Reports',
    download_demographic_report: 'Download Demographic Report',
    download_demographic_description: 'Download comprehensive demographic data of all employees',
    select_report_type: 'Select Report Type',
    add_report_type: 'Add Report Type',
    file_format: 'File Format',
    download_report_btn: 'Download Report',
    last_updated: 'Last Updated',
    report_info: 'Report Information',
    realtime_data: 'Real-time Data',
    various_formats: 'Various Formats',
    combine_reports: 'Combine Reports',
    image_formats: 'Image Formats',
    select_format: 'Select Format',
    select_report: 'Select Report',
    select_format_pdf: 'PDF',
    select_format_xlsx: 'Excel',
    select_format_csv: 'CSV',
    select_format_docx: 'Word',
    select_format_jpg: 'JPG',
    select_format_png: 'PNG',
    
    // Profile Page
    profile_title: 'Employee Profile',
    profile_description: 'Manage employee profile information',
    profile_info: 'Profile Information',
    edit_profile: 'Edit Profile',
    full_name: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    birth_date: 'Birth Date',
    join_date: 'Join Date',
    role: 'Role',
    change_password: 'Change Password',
    save_changes: 'Save Changes',
    cancel_edit: 'Cancel Edit',
    confirm_password: 'Confirm Password',
    current_password: 'Current Password',
    new_password: 'New Password',
    
    // Charts
    chart_position_distribution: 'Position Distribution',
    chart_education_level: 'Education Level Distribution',
    chart_rank_distribution: 'Rank Distribution',
    chart_employment_status: 'Employment Status Distribution',
    chart_age_distribution: 'Age Distribution',
    chart_gender_distribution: 'Gender Distribution',
    chart_years_of_service: 'Years of Service Distribution',
    
    // Settings
    settings_title: 'Settings',
    settings_appearance: 'Appearance',
    settings_language: 'Language',
    settings_theme: 'Theme',
    settings_theme_light: 'Light',
    settings_theme_dark: 'Dark',
    settings_theme_system: 'System',
    settings_font_size: 'Font Size',
    settings_font_small: 'Small',
    settings_font_medium: 'Medium',
    settings_font_large: 'Large',
    settings_notifications: 'Notifications',
    settings_account: 'Account',
    settings_privacy: 'Privacy',
    settings_help: 'Help',
    settings_adjust_preference: 'Customize app display according to your preferences',
    settings_title_notification: 'Notification Settings',
    settings_appearance_instruction: 'Adjust the appearance settings for your dashboard',
    settings_storage: 'Storage',
    
    // Education levels
    education_elementary: 'Elementary School',
    education_junior_high: 'Junior High School',
    education_high_school: 'High School',
    education_diploma: 'Diploma',
    education_undergraduate: 'Bachelor\'s Degree',
    education_masters: 'Master\'s Degree',
    education_doctorate: 'Doctorate',
    education_summary: 'Education Summary',
    
    // Employment positions
    position_title: 'Position',
    position_summary: 'Position Summary',
    
    // Employees
    employee_education: 'Education',
    employee_join_date: 'Join Date',
    
    // Profile
    profile_personal_info: 'Personal Information',
    profile_contact_info: 'Contact Information',
    profile_employment_info: 'Employment Information',
    profile_education_info: 'Education Information',
    profile_settings: 'Profile Settings',
    
    // Messages
    success_save: 'Successfully saved',
    error_general: 'An error occurred',
    confirm_delete: 'Confirm deletion',
    no_data: 'No data',
    loading_data: 'Loading data...',
    please_wait: 'Please wait while we prepare the report visualizations.',
    rising: 'Rising',
    try_again: 'Try Again',
    no_employees_data_for_export: 'No employee data for export',
    
    // User Management
    user_management: 'User Management',
    user_management_desc: 'Manage users and application access',
    add_user: 'Add User',
    edit_user: 'Edit User',
    delete_user: 'Delete User',
    user_name: 'Name',
    user_username: 'Username',
    user_email: 'Email',
    user_role: 'Role',
    user_created: 'Registered',
    user_last_login: 'Last Login',
    user_actions: 'Actions',
    search_users: 'Search users...',
    no_users_found: 'No users found',
    loading_users: 'Loading user data...',
    user_added: 'User successfully added',
    user_updated: 'User successfully updated',
    user_deleted: 'User successfully deleted',
    cannot_delete_own_account: 'You cannot delete your own account',
    cannot_delete_admin: 'You do not have permission to delete admins or superadmins',
    confirm_delete_user: 'Are you sure you want to delete user',
    user_role_admin: 'Admin',
    user_role_superadmin: 'Super Admin',
    user_role_user: 'User',
    access_denied: 'Access Denied',
    access_denied_message: 'You do not have permission to access this page. Only admins and superadmins can manage users.',
    
    // Leave Management
    leave_management: 'Leave Management',
    leave_title: 'Employee Leave',
    leave_description: 'Manage employee leave requests',
    leave_employee_name: 'Employee Name',
    leave_type: 'Leave Type',
    leave_duration: 'Duration',
    leave_allocation: 'Total Allocation',
    leave_balance: 'Remaining',
    leave_period: 'Period',
    leave_status: 'Status',
    leave_reason: 'Leave Reason',
    leave_dates: 'Leave Dates',
    leave_start_date: 'Start Date',
    leave_end_date: 'End Date',
    leave_request: 'Leave Request',
    leave_add: 'Add Leave',
    leave_edit: 'Edit Leave',
    leave_delete: 'Delete Leave',
    leave_approve: 'Approve',
    leave_reject: 'Reject',
    leave_cancel: 'Cancel',
    leave_detail: 'Leave Details',
    leave_history: 'Leave History',
    leave_quota: 'Leave Quota',
    leave_working_days: 'Working Days',
    leave_holidays: 'Holidays',
    leave_weekends: 'Weekends',
    leave_non_working_days: 'Non-Working Days',
    leave_annual: 'Annual',
    leave_big: 'Extended',
    leave_sick: 'Sick',
    leave_maternity: 'Maternity',
    leave_important_reason: 'Important Reason',
    leave_unpaid: 'Unpaid',
    leave_collective: 'Collective Leave',
    leave_details_title: 'Employee Leave Details',
    leave_employee_info: 'Employee Information',
    leave_info: 'Leave Information',
    leave_nip: 'Employee ID/NIP',
    leave_remaining: 'Remaining Leave',
    leave_used: 'Used',
    leave_from_previous_year: 'From Previous Year',
    leave_total_available: 'Total Available Leave',
    leave_system_info: 'System Information',
    leave_created_at: 'Created at',
    leave_updated_at: 'Last updated',
    leave_created_by: 'Created by',
    leave_summary: 'All Leave Types Summary',
    leave_action_view: 'View Details',
    leave_add_form_title: 'Add Leave Record',
    leave_workday_count: 'Working Day Count',
    leave_apply: 'Apply for Leave',
  }
};

export default translations;