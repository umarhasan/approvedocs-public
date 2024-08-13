<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nick | Dashboard</title>

    <!-- Google Font: Source Sans Pro -->
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="{{ asset('/admin/plugins/fontawesome-free/css/all.min.css') }}">
    <!-- Ionicons -->
    <link rel="stylesheet" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css">
    <!-- Tempusdominus Bootstrap 4 -->
    <link rel="stylesheet"
        href="{{ asset('/admin/plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css') }}">
    <!-- iCheck -->
    <link rel="stylesheet" href="{{ asset('/admin/plugins/icheck-bootstrap/icheck-bootstrap.min.css') }}">
    <!-- JQVMap -->
    <link rel="stylesheet" href="{{ asset('/admin/plugins/jqvmap/jqvmap.min.css') }}">
    <!-- Theme style -->
    <link rel="stylesheet" href="{{ asset('/admin/dist/css/adminlte.min.css') }}">
    <!-- overlayScrollbars -->
    <link rel="stylesheet" href="{{ asset('/admin/plugins/overlayScrollbars/css/OverlayScrollbars.min.css') }}">
    <!-- Daterange picker -->
    <link rel="stylesheet" href="{{ asset('/admin/plugins/daterangepicker/daterangepicker.css') }}">
    <!-- summernote -->
    <link rel="stylesheet" href="{{ asset('/admin/plugins/summernote/summernote-bs4.min.css') }}">
    <!-- Toastr -->
    <link rel="stylesheet" href="{{ asset('/admin/plugins/toastr/toastr.min.css') }}">

</head>

<body class="hold-transition sidebar-mini layout-fixed">
    <div class="wrapper">

        <!-- Preloader -->
        <div class="preloader flex-column justify-content-center align-items-center">
            <img class="animation__shake" src="{{ asset('admin/dist/img/AdminLTELogo.png') }}" alt="AdminLTELogo"
                height="60" width="60">
        </div>


        <!-- Main Sidebar Container -->
        <aside class="main-sidebar sidebar-dark-primary elevation-4">
            <!-- Brand Logo -->
            <a href="index3.html" class="brand-link">
                <img src="{{ asset('/admin/dist/img/AdminLTELogo.png') }}" alt="AdminLTE Logo"
                    class="brand-image img-circle elevation-3" style="opacity: .8">
                <span class="brand-text font-weight-light">Nick</span>
            </a>

            <!-- Sidebar -->
            <div class="sidebar">
                <!-- Sidebar user panel (optional) -->
                <div class="user-panel mt-3 pb-3 mb-3 d-flex">
                    <div class="image">
                        <img src="{{ asset('/admin/dist/img/user2-160x160.jpg') }}" class="img-circle elevation-2"
                            alt="User Image">
                    </div>
                    <div class="info">
                        <a href="#" class="d-block">{{ Auth::user()->name }}</a>
                    </div>
                </div>

                <!-- SidebarSearch Form -->
                <div class="form-inline">
                    <div class="input-group" data-widget="sidebar-search">
                        <input class="form-control form-control-sidebar" type="search" placeholder="Search"
                            aria-label="Search">
                        <div class="input-group-append">
                            <button class="btn btn-sidebar">
                                <i class="fas fa-search fa-fw"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Sidebar Menu -->
                <nav class="mt-2">
                    <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu"
                        data-accordion="false">


                        <li class="nav-item {{ request()->routeIs('admin.dashboard') ? 'menu-open' : '' }} ">
                            <a href="#"
                                class="nav-link nav-dropdown-toggle {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
                                <i class="nav-icon fas fa-table"></i>
                                <p>
                                    Dashboard
                                    <i class="fas fa-angle-left right"></i>
                                </p>
                            </a>
                            <ul class="nav nav-treeview">

                                <li class="nav-item">
                                    <a href="{{ route('admin.dashboard') }}"
                                        class="nav-link {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
                                        <i class="far fa-circle nav-icon"></i>
                                        <p>Dashboard</p>
                                    </a>
                                </li>


                            </ul>
                        </li>

                        <li class="nav-item">
                            <a href="{{ route('notes.index') }}"
                                class="nav-link {{ request()->routeIs('notes.index') ? 'active' : '' }}">
                                <i class="fas fa-check-circle nav-icon"></i>
                                <p>Notes</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('place.new') }}"
                                class="nav-link {{ request()->routeIs('place.new') ? 'active' : '' }}">
                                <i class="fas fa-map-marker nav-icon"></i>
                                <p>Places</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('package.new') }}"
                                class="nav-link {{ request()->routeIs('package.new') ? 'active' : '' }}">
                                <i class="fas fa-gift nav-icon"></i>
                                <p>Packages</p>
                            </a>
                        </li>



                        <li class="nav-item {{ request()->routeIs('roles.index') ? 'menu-open' : '' }} ">
                            @can('role-list')
                                <a href="#"
                                    class="nav-link nav-dropdown-toggle {{ request()->routeIs('roles.index') ? 'active' : '' }}">
                                    <i class="nav-icon fas fa-table"></i>
                                    <p>
                                        Manage Roles
                                        <i class="fas fa-angle-left right"></i>
                                    </p>
                                </a>
                            @endcan
                            <ul class="nav nav-treeview">
                                @can('role-list')
                                    <li class="nav-item">
                                        <a href="{{ route('roles.index') }}"
                                            class="nav-link {{ request()->routeIs('roles.index') ? 'active' : '' }}">
                                            <i class="far fa-circle nav-icon"></i>
                                            <p>List Roles</p>
                                        </a>
                                    </li>
                                @endcan

                                @can('role-create')
                                    <li class="nav-item">
                                        <a href="#" class="nav-link">
                                            <i class="far fa-circle nav-icon"></i>
                                            <p>Add Role</p>
                                        </a>
                                    </li>
                                @endcan
                            </ul>
                        </li>
                        @can('user-list')
                            <li
                                class="nav-item {{ request()->routeIs('users.index') ? 'menu-open' : '' }} {{ request()->routeIs('users.create') ? 'menu-open' : '' }}">
                                <a href="#"
                                    class="nav-link nav-dropdown-toggle {{ request()->routeIs('users.index') ? 'active' : '' }} {{ request()->routeIs('users.create') ? 'active' : '' }}">
                                    <i class="nav-icon fas fa-table"></i>
                                    <p>
                                        Manage Users
                                        <i class="fas fa-angle-left right"></i>
                                    </p>
                                </a>
                                <ul class="nav nav-treeview">
                                    @can('user-list')
                                        <li class="nav-item">
                                            <a href="{{ route('users.index') }}"
                                                class="nav-link {{ request()->routeIs('users.index') ? 'active' : '' }}">
                                                <i class="far fa-circle nav-icon"></i>
                                                <p>List Users</p>
                                            </a>
                                        </li>
                                    @endcan
                                    @can('user-create')
                                        <li class="nav-item">
                                            <a href="{{ route('users.create') }}"
                                                class="nav-link {{ request()->routeIs('users.create') ? 'active' : '' }}">
                                                <i class="far fa-circle nav-icon"></i>
                                                <p>Add Users</p>
                                            </a>
                                        </li>
                                    @endcan
                                </ul>
                            </li>
                        @endcan
                        @can('permission-list')
                            <li
                                class="nav-item {{ request()->routeIs('permission.index') ? 'menu-open' : '' }} {{ request()->routeIs('permission.create') ? 'menu-open' : '' }}">
                                <a href="#"
                                    class="nav-link nav-dropdown-toggle {{ request()->routeIs('permission.index') ? 'active' : '' }} {{ request()->routeIs('permission.create') ? 'active' : '' }}">
                                    <i class="nav-icon fas fa-table"></i>
                                    <p>
                                        Manage Permissions
                                        <i class="fas fa-angle-left right"></i>
                                    </p>
                                </a>
                                <ul class="nav nav-treeview">
                                    @can('permission-list')
                                        <li class="nav-item">
                                            <a href="{{ route('permission.index') }}"
                                                class="nav-link {{ request()->routeIs('permission.index') ? 'active' : '' }}">
                                                <i class="far fa-circle nav-icon"></i>
                                                <p>List Permissions</p>
                                            </a>
                                        </li>
                                    @endcan
                                    @can('permission-create')
                                        <li class="nav-item">
                                            <a href="{{ route('permission.create') }}"
                                                class="nav-link {{ request()->routeIs('permission.create') ? 'active' : '' }}">
                                                <i class="far fa-circle nav-icon"></i>
                                                <p>Add Permission</p>
                                            </a>
                                        </li>
                                    @endcan
                                </ul>
                            </li>
                        @endcan

                        @can('general_setting')
                            <li class="nav-item {{ request()->routeIs('general_setting.index') ? 'menu-open' : '' }} ">
                                <a href="#"
                                    class="nav-link nav-dropdown-toggle {{ request()->routeIs('general_setting.index') ? 'active' : '' }}">
                                    <i class="nav-icon fas fa-table"></i>
                                    <p>
                                        Manage General Setting
                                        <i class="fas fa-angle-left right"></i>
                                    </p>
                                </a>
                                <ul class="nav nav-treeview">
                                    <li class="nav-item">
                                        <a href="{{ route('general_setting.index') }}"
                                            class="nav-link {{ request()->routeIs('general_setting.index') ? 'active' : '' }}">
                                            <i class="far fa-circle nav-icon"></i>
                                            <p>General Setting</p>
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        @endcan
                        @can('account_setting')
                            <li
                                class="nav-item {{ request()->routeIs('games.index') ? 'menu-open' : '' }} {{ request()->routeIs('change_password') ? 'menu-open' : '' }} {{ request()->routeIs('change_password') ? 'menu-open' : '' }}">
                                <a href="#"
                                    class="nav-link nav-dropdown-toggle  {{ request()->routeIs('profile.index') ? 'active' : '' }} {{ request()->routeIs('games.index') ? 'active' : '' }} {{ request()->routeIs('change_password') ? 'menu-open' : '' }}">
                                    <i class="nav-icon fas fa-table"></i>
                                    <p>
                                        Account Setting
                                        <i class="fas fa-angle-left right"></i>
                                    </p>
                                </a>
                                <ul class="nav nav-treeview">
                                    <!-- @can('permission-list')
        -->
                                        <li class="nav-item">
                                            <a href="{{ route('profile.index') }}"
                                                class="nav-link {{ request()->routeIs('profile.index') ? 'active' : '' }}">
                                                <i class="far fa-circle nav-icon"></i>
                                                <p>Profile</p>
                                            </a>
                                        </li>

                                        <!--
    @endcan -->
                                    <li class="nav-item">
                                        <a href="{{ route('change_password') }}"
                                            class="nav-link {{ request()->routeIs('change_password') ? 'active' : '' }}">
                                            <i class="far fa-circle nav-icon"></i>
                                            <p>Change Password</p>
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        @endcan


                        <li class="nav-item">
                            <a href="{{ url('/logout') }}" class="nav-link">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Logout</p>
                            </a>
                        </li>

                    </ul>
                </nav>
                <!-- /.sidebar-menu -->
            </div>
            <!-- /.sidebar -->
        </aside>
        @yield('content')
        <!-- /.content-wrapper -->
        <footer class="main-footer">
            <strong>Copyright &copy; 2022-2023 <a href="#">Nick</a>.</strong>
            All rights reserved.
            <div class="float-right d-none d-sm-inline-block">
                <b></b>
            </div>
        </footer>

        <!-- Control Sidebar -->
        <aside class="control-sidebar control-sidebar-dark">
            <!-- Control sidebar content goes here -->
        </aside>
        <!-- /.control-sidebar -->
    </div>
    <!-- ./wrapper -->

    <!-- jQuery -->
    <script src="{{ asset('/admin/plugins/jquery/jquery.min.js') }}"></script>
    <!-- jQuery UI 1.11.4 -->
    <script src="{{ asset('/admin/plugins/jquery-ui/jquery-ui.min.js') }}"></script>
    <!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
    <script>
        $.widget.bridge('uibutton', $.ui.button)
    </script>
    <!-- Bootstrap 4 -->
    <script src="{{ asset('/admin/plugins/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
    <!-- ChartJS -->
    <script src="{{ asset('/admin/plugins/chart.js/Chart.min.js') }}"></script>
    <!-- Sparkline -->
    <script src="{{ asset('/admin/plugins/sparklines/sparkline.js') }}"></script>
    <!-- JQVMap -->
    <script src="{{ asset('/admin/plugins/jqvmap/jquery.vmap.min.js') }}"></script>
    <script src="{{ asset('/admin/plugins/jqvmap/maps/jquery.vmap.usa.js') }}"></script>
    <!-- jQuery Knob Chart -->
    <script src="{{ asset('/admin/plugins/jquery-knob/jquery.knob.min.js') }}"></script>
    <!-- daterangepicker -->
    <script src="{{ asset('/admin/plugins/moment/moment.min.js') }}"></script>
    <script src="{{ asset('/admin/plugins/daterangepicker/daterangepicker.js') }}"></script>
    <!-- Tempusdominus Bootstrap 4 -->
    <script src="{{ asset('/admin/plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js') }}"></script>
    <!-- overlayScrollbars -->
    <script src="{{ asset('/admin/plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js') }}"></script>
    <!-- AdminLTE App -->
    <script src="{{ asset('/admin/dist/js/adminlte.js') }}"></script>

    <!-- geo Location -->

    <!-- Toastr -->
    <script src="{{ asset('/admin/plugins/toastr/toastr.min.js') }}"></script>
    <script>
        @if (session('success'))
            toastr.success("{{ session('success') }}");
        @endif
        @if (session('error'))
            toastr.error("{{ session('error') }}")
        @endif
        @if ($errors->any())
            @foreach ($errors->all() as $error)
                toastr.error("{{ $error }}")
            @endforeach
        @endif
    </script>

    <!-- Change password -->
    <script src="https://cdn.jsdelivr.net/npm/jquery-validation@1.19.3/dist/jquery.validate.js" type="text/javascript">
    </script>



    <!-- DataTables  & Plugins -->
    <script src="{{ asset('/admin/plugins/datatables/jquery.dataTables.min.js') }}"></script>
    <script src="{{ asset('/admin/plugins/datatables-bs4/js/dataTables.bootstrap4.min.js') }}"></script>
    <script src="{{ asset('/admin/plugins/datatables-responsive/js/dataTables.responsive.min.js') }}"></script>
    <script src="{{ asset('/admin/plugins/datatables-responsive/js/responsive.bootstrap4.min.js') }}"></script>
    <script src="{{ asset('/admin/plugins/datatables-buttons/js/dataTables.buttons.min.js') }}"></script>
    <script src="{{ asset('/admin/plugins/datatables-buttons/js/buttons.bootstrap4.min.js') }}"></script>
    <script src="{{ asset('/admin/plugins/jszip/jszip.min.js') }}"></script>
    <script src="{{ asset('/admin/plugins/pdfmake/pdfmake.min.js') }}"></script>
    <script src="{{ asset('/admin/plugins/pdfmake/vfs_fonts.js') }}"></script>
    <script src="{{ asset('/admin/plugins/datatables-buttons/js/buttons.html5.min.js') }}"></script>
    <script src="{{ asset('/admin/plugins/datatables-buttons/js/buttons.print.min.js') }}"></script>
    <script src="{{ asset('/admin/plugins/datatables-buttons/js/buttons.colVis.min.js') }}"></script>
    <!-- Summernote -->
    <script src="{{ asset('/admin/plugins/summernote/summernote-bs4.min.js') }}"></script>
    <script src="{{ asset('js/style.js') }}"></script>

    <script>
        $(function() {
            $('#summernote').summernote();
            $('#summernote1').summernote();

            $("#example1").DataTable({

                "scrollX": true,
                "lengthChange": false,
                "autoWidth": false,
                "buttons": ["csv", "excel", "pdf", "print"]
            }).buttons().container().appendTo('#example1_wrapper .col-md-6:eq(0)');
            $('#example2').DataTable({
                "paging": true,
                "lengthChange": true,
                "searching": true,
                "ordering": true,
                "info": true,
                "autoWidth": false,
                "responsive": true,
            });
        });
    </script>


</body>

</html>
