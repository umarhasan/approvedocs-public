<!DOCTYPE html>
<html lang="en">
<head>
 

  <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
        integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css"
        integrity="sha512-tS3S5qG0BlhnQROyJXvNjeEM4UpMXHrQfTGmbQ1gKmelCxlSEBUaxhRBj/EFTzpbP4RVSrpEikbmdJobCvhE3g=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css"
        integrity="sha512-sMXtMNL1zRzolHYKEujM2AqCLUR9F2C4/05cdbxjjLSRvMQIciEPCQZo++nk7go3BtSuK9kfa/s+a4f4i5pLkw=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link href="./assets/css/style.css" rel="stylesheet" />
    <title>Approve Docx</title>
</head>


<body class="p-0">
    <nav class="navbar navbar-expand-lg nav-mob">
        <div class="container-fluid">
            <div class="row align-items-center">
                <div class="col-md-10 col-lg-2 col-8 d-block text-start" id="ali-left">
                    <a class="navbar-brand" href="/"><img src="./assets/images/logo.png" alt="logo" class="logo"></a>
                </div>
                <div class="col-md-2 col-lg-7 col-4 d-block">
                    <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas"
                        data-bs-target="#navbarOffcanvas" aria-controls="navbarOffcanvas" aria-expanded="false"
                        aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="offcanvas offcanvas-end bg-secondary secondary-1" id="navbarOffcanvas" tabindex="-1"
                        aria-labelledby="offcanvasNavbarLabel">
                        <div class="offcanvas-header">
                            <a class="navbar-brand" href="/"><img src="./assets/images/logo.png" alt="logo"
                                    class="logo off-logo"></a>
                            <button type="button" class="btn-close btn-close-black text-reset"
                                data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </div>
                        <div class="offcanvas-body">
                            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                                <li class="nav-link dp-mob">
                                    <form>
                                        <div class="input-group modal-form">
                                            <div class="form-outline">
                                                <input type="search" id="form1" class="form-control"
                                                    placeholder="Search..." />
                                            </div>
                                            <button class="btn btn-search-form" type="submit">
                                                <i class="fas fa-search"></i>
                                            </button>
                                        </div>
                                    </form>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link active" aria-current="page" href="/">Home</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="{{ route('about_us') }}">About</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="{{ route('service') }}">Service</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="{{ route('contact_us') }}">Contact Us</a>
                                </li>
                                
                                <li class="nav-link dp-mob">
                                    <button type="button" class="btn1">Sign In</button>
                                </li>
                                <li class="nav-link dp-mob">
                                    <button type="button" class="btn1">Sign up</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="col-md-3" id="dp">
                    <!--Search Modal-->
                    <button type="button" class="btn p-0" data-bs-toggle="modal" data-bs-target="#exampleModal">
                        <i class="fa-sharp fa-solid fa-magnifying-glass"></i>
                    </button>

                    <!-- Modal -->
                    <div class="modal fade p-0" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel"
                        aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-body">
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"
                                        aria-label="Close"></button>
                                    <form>
                                        <div class="input-group modal-form">
                                            <div class="form-outline">
                                                <input type="search" id="form1" class="form-control"
                                                    placeholder="Search..." />
                                            </div>
                                            <button class="btn btn-search-form" type="submit">
                                                <i class="fas fa-search"></i>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!--Search Modal-->
                    <a class="btn1" href="{{ route('login') }}">Sign In</a>
                    <a class="btn1" href="{{ route('register') }}">Sign up</a>
                </div>
            </div>
        </div>
    </nav>
   <!-- /.content-header -->
   @yield('content')
 <!-- /.content-wrapper -->
    <footer>
        <div class="container-fluid fl1">
            <div class="row">
                <div class="col-md-3">
                    <img src="./assets/images/logo-white.png" alt="footer-logo" class="footer-logo" />
                    <p class="u">3891 Jl. Jailbreak Avenue California, 62640</p>
                    <p class="u">(120) 555-0108</p>
                    <p class="u">x-y-z@office.com</p>
                </div>
                <div class="col-md-1"></div>
                <div class="col-md-2">
                    <h3 class="v">Company</h3>
                    <ul class="w">
                        <a href="{{ route('about_us') }}">
                            <li>About Us</li>
                        </a>
                        <a href="{{ route('careers') }}">
                            <li>Career</li>
                        </a>
                        <a href="{{ route('blog') }}">
                            <li>Blog</li>
                        </a>
                        <a href="{{ route('news') }}">
                            <li>News</li>
                        </a>
                    </ul>
                </div>
                <div class="col-md-2">
                    <h3 class="v">Resources</h3>
                    <ul class="w">
                        <a href="{{ route('accounts') }}">
                            <li>Account</li>
                        </a>
                        <a href="{{ route('feedback') }}">
                            <li>Feedback</li>
                        </a>
                        <a href="{{ route('helpdesk')}}">
                            <li>Helpdesk</li>
                        </a>
                        <a href="{{ route('term_of_service') }}">
                            <li>Term of Service</li>
                        </a>
                        <a href="{{ route('privacy_policy') }}">
                            <li>Privacy Policy</li>
                        </a>
                        <a href="{{ route('faq') }}">
                            <li>FAQs</li>
                        </a>
                    </ul>
                </div>
                <div class="col-md-1"></div>
                <div class="col-md-3">
                    <h3 class="v">Follow Us</h3>
                    <i class="fa-brands fa-instagram"></i>
                    <i class="fa-brands fa-facebook"></i>
                    <i class="fa-brands fa-linkedin-in"></i>
                    <i class="fa-brands fa-twitter"></i>
                    <h3 class="x">Newsletter</h3>
                    <form class="d-flex">
                        <input class="form-control email" type="text" required placeholder="Email">
                        <button class="btn10" type="submit">Search</button>
                    </form>
                </div>
            </div>
        </div>

      

        <div class="copyright">
            <h5 class="y">Copyright 2023. All Right Reserved</h5>
        </div>
    </footer>


    <script src="assets/js/script.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN"
    crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.6.3.js" integrity="sha256-nQLuAZGRRcILA+6dMBOvcRh5Pe310sBpanc6+QBmyVM="
    crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js"
    integrity="sha512-bPs7Ae6pVvhOSiIcyUClR7/q2OAsRiovw4vAkX+zJbw3ShAeeqezq50RIIcIURq7Oa20rW2n2q+fyXBNcU9lrw=="
    crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script>
    $('.owl-carousel').owlCarousel({
        loop: true,
        nav: true,
        dots: false,
        navText: ["<i class='fa fa-arrow-left'></i>", "<i class='fa fa-arrow-right'></i>"],
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 1
            },
            1000: {
                items: 1
            }
        }
    })
</script>
</body>
</html>
