<!DOCTYPE html>
@extends('front.layouts.app')
@section('content')
    <section class="bg1ab">
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-1"></div>
                <div class="col-md-10">
                    <h1 class="ax">Contact <span class="about"> Us</span></h1>
                </div>
                <div class="col-md-1"></div>
            </div>
        </div>
    </section>
    <section class="contactbg">
        <div class="container" id="p3b">
            <div class="row">
                <div class="col-md-12">
                    <h4 class="i">Best Your website</h4>
                    <h3 class="ja">Get in touch <span class="span4b"> Today!</span></h3>
                    <p class="s cor">Seamlessly enable best-of-breed portals and out-of-the-box core
                        competencies cross-platform channels and granular infomediaries.</p>
                </div>
                <div class="col-md-3"></div>
                <div class="col-md-3">
                    <div class="m2">
                        <img src="./assets/images/envelope.jpg" alt="env" class="envelope">
                        <h4 class="p">Email Address</h4>
                        <a href="mailto:x-y-z@support.com">
                            <h5 class="q">x-y-z@support.com</h5>
                        </a>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="m2">
                        <img src="./assets/images/phone.jpg" alt="phone" class="phone">
                        <h4 class="p">Phone</h4>
                        <a href="tel:80 1789 1456 456">
                            <h5 class="q">+80 1789 1456 456</h5>
                        </a>
                    </div>
                </div>
                <div class="col-md-3"></div>
                <div class="col-md-12" id="g-3a">
                    <form class="row g-3a">
                        <div class="col-md-6">
                            <input type="text" class="form-control" id="inputFirst" placeholder="First Name">
                        </div>
                        <div class="col-md-6">
                            <input type="text" class="form-control" id="inputFirst" placeholder="Last Name">
                        </div>
                        <div class="col-6">
                            <input type="email" class="form-control" id="inputFirst" placeholder="Email">
                        </div>
                        <div class="col-6">
                            <input type="text" class="form-control" id="inputFirst" placeholder="Phone">
                        </div>
                        <div class="col-6">
                            <input type="text" class="form-control" id="inputFirst" placeholder="Subject">
                        </div>
                        <div class="col-6">
                            <input type="text" class="form-control" id="inputFirst" placeholder="Company">
                        </div>
                        <div class="col-12">
                            <textarea rows="6" class="form-control" id="inputMessage" placeholder="Message"></textarea>
                        </div>
                        <div class="col-12">
                            <button type="submit" class="btn9a">Get In Touch</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>
    <section class="bg6">
        <div class="container" id="p3">
            <div class="row">
                <div class="col-md-12">
                    <h4 class="i">Customer Feedback</h4>
                    <h3 class="j">Hear what our<span class="span4"> amazing</span> <br> customers say</h3>
                    <div class="m4">
                        <div class="owl-carousel owl-theme">
                            <div class="item">
                                <div class="container m5">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <img src="./assets/images/t1.jpg" alt="t1" class="t1" />
                                        </div>
                                        <div class="col-md-8 align-self-center">
                                            <!-- <h4 class="r">"Lorem ipsum dolor sit amet, consectetur" adipiscing elit.
                                            </h4> -->
                                            <p class="s">They have been a game-changer for our sales team. The ease of
                                                use, real-time notifications, and collaboration tools have streamlined
                                                our proposal process and allowed us to close deals faster. The
                                                integration with our CRM has also been a huge time-saver. We highly
                                                recommend this company to
                                                anyone looking to streamline their document management.
                                            </p>
                                            <h4 class="t">Sarah</h4>
                                            <p class="s">Marketing Manager</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="item">
                                <div class="container m5">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <img src="./assets/images/t1.jpg" alt="t1" class="t1" />
                                        </div>
                                        <div class="col-md-8 align-self-center">
                                            <!-- <h4 class="r">"Lorem ipsum dolor sit amet, consectetur" adipiscing elit.
                                            </h4> -->
                                            <p class="s">As a small business owner, I was hesitant to try new software,
                                                but it exceeded my expectations. The pre-built templates and fillable
                                                PDFs have made creating professional proposals a breeze, and the
                                                e-signatures have saved me so much time and effort. I'm amazed at how
                                                much more
                                                productive I've become since switching to this firm.
                                            </p>
                                            <h4 class="t">Mark</h4>
                                            <p class="s">Small Business Owner</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="item">
                                <div class="container m5">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <img src="./assets/images/t1.jpg" alt="t1" class="t1" />
                                        </div>
                                        <div class="col-md-8 align-self-center">
                                            <!-- <h4 class="r">"Lorem ipsum dolor sit amet, consectetur" adipiscing elit.
                                            </h4> -->
                                            <p class="s">Our team has been using their CRM for a few months, and it has
                                                been a total game-changer. The automated workflow has reduced the time
                                                it takes to close a deal, and the real-time notifications keep us in the
                                                know. The
                                                integration with our CRM has also made our process more
                                                efficient. We couldn't be happier with our decision to switch
                                                to them.
                                            </p>
                                            <h4 class="t">Jenny</h4>
                                            <p class="s">Sales Director</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection