@extends('front.layouts.app')
@section('content')
<section class="bg1">
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-1"></div>
                <div class="col-md-10">
                    <h1 class="a">Empower Your Business with <span class="sign"> Cloud-Based </span> Document Management
                        and E- Signatures</h1>
                    <p class="b">Today, businesses need to be more efficient and effective in order to stay afloat.
                        That's where our Cloud-Based Document Management and E-Signatures come in. Get greater control
                        over your documents and save time and energy with Approve Docx's easy-to-use technology!
                    </p>
                    <button type="button" class="btn3">Start free 14-day trial</button>
                    <button type="button" class="btn4">Request a demo</button>
                </div>
                <div class="col-md-1"></div>
            </div>
        </div>
    </section>
    <section class="bg2">
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <h2 class="c">Create, Send, and Sign Documents in a Flash</h2>
                    <p class="d">Not just e-sign, our suite of tools makes creating and sending e-documents quick and
                        easy.
                    </p>
                </div>
                <div class="col-md-1"></div>
                <div class="col-md-10">
                    <form class="d-flex" role="search">
                        <input class="form" type="search" placeholder="Search" aria-label="Search">
                        <button class="btn5" type="submit">Search</button>
                    </form>
                </div>
                <div class="col-md-1"></div>
                <div class="col-md-1"></div>
                <div class="col-md-10">
                    <ul class="li1">
                        <li>.com</li>
                        <li>.store</li>
                        <li>.id</li>
                        <li>.co.id</li>
                        <li>.co</li>
                        <li>.net</li>
                    </ul>
                </div>
                <div class="col-md-1"></div>
            </div>
        </div>
    </section>
    <section class="bg3">
        <div class="container">
            <div class="row">
                <div class="col-md-6 align-self-center" id="p1">
                    <h4 class="e">About Us</h4>
                    <h2 class="f">Streamline Your Document Management with E-Signatures and Automated <span
                            class="span1"> Workflow</span></h2>
                    <p class="g">We are revolutionising the way you manage your documents with our cloud-based solution.
                        From e-signatures to automated workflow, we make it easy to create, send, and receive
                        professional proposals, contracts, and letters. With fillable PDFs, web links, and
                        brand-approved templates, you can ensure the look, feel, and actions within every document align
                        with your brand. Plus, our CRM integration and real-time notifications keep you in the know,
                        allowing you to deliver an amazing buying experience for your prospects. Embrace the power of
                        electronic and digital signatures with us.
                    </p>
                    <a href="{{ route('about_us')}}"><button type="button" class="btn6">Learn More</button></a>
                </div>
                <div class="col-md-6">
                    <img src="{{ asset('assets/images/girl.png') }}" alt="girl" class="girl" />
                </div>
            </div>
        </div>
    </section>
    <section class="bg4">
        <div class="container" id="p2">
            <div class="row">
                <div class="col-md-12" id="a1">
                    <h4 class="i">Services</h4>
                    <h2 class="j">We have extensive <br> Experience in <span class="span2">Marketing</span></h2>
                </div>
            </div>
            <div class="inner">
                <div class="row">
                    <div class="col-md-4 col-lg-3 col1 x1">
                        <img src="./assets/images/d-1.png" alt="d1" class="d1" />
                        <h4 class="k">E-Signatures</h4>
                        <p class="l"><span style="font-weight: 600;"> Sign Digitally, Save Time and Effort.</span> <br>
                            E-Signatures from us simplify the signing process for you and your clients. Say goodbye to
                            printing, signing, scanning, and sending physical documents...</p>
                        <a href="{{ route('E_Signature') }}"><button type="button" class="btn7">Learn More</button></a>
                    </div>
                    <div class="col-md-4 col-lg-3 col1 y1">
                        <img src="./assets/images/d-2.png" alt="d1" class="d1" />
                        <h4 class="k">Proposal Templates</h4>
                        <p class="l"><span style="font-weight: 600;"> Impress Your Clients with Stunning
                                Proposals.
                            </span> <br> You can create stunning, professional proposals in minutes with our proposal
                            templates. Our library of pre-built templates...
                        </p>
                        <a href="{{ route('proposal_templates') }}"><button type="button" class="btn7">Learn More</button></a>
                    </div>
                    <div class="col-md-4 col-lg-3 col1 z1">
                        <img src="./assets/images/d-3.png" alt="d1" class="d1" />
                        <h4 class="k">Fillable PDFs</h4>
                        <p class="l"><span style="font-weight: 600;"> Streamline Your Data Collection with Fillable PDFs
                            </span> <br> Collect data quickly and efficiently with our fillable PDFs. Our intuitive
                            solution allows you to create accessible PDF forms...
                        </p>
                        <a href="{{ route('fillable_pdf') }}"><button type="button" class="btn7">Learn More</button></a>
                    </div>
                    <div class="col-md-4 col-lg-3 col1 zz">
                        <img src="./assets/images/d-4.png" alt="d1" class="d1" />
                        <h4 class="k">CRM Integration</h4>
                        <p class="l"><span style="font-weight: 600;"> Streamline Your Workflow with CRM!
                            </span> <br> Eliminate manual data entry and improve your workflow with our CRM integration.
                            Our integration with popular CRMS such as...
                        </p>
                        <a href="{{ route('email_crm_integration') }}"><button type="button" class="btn7">Learn
                                More</button></a>
                    </div>

                    <div class="col-md-4 col-lg-3 col1 x1">
                        <img src="./assets/images/d-2.png" alt="d1" class="d1" />
                        <h4 class="k">Document Management</h4>
                        <p class="l"><span style="font-weight: 600;"> Effortlessly Manage Your Documents with Us.
                            </span> <br> We make document management a breeze. Our cloud-based solution allows you to
                            easily send, receive, and store your proposals, contracts, and letters. Our real-time
                            notifications...
                        </p>
                        <a href="{{ route('document_management') }}"><button type="button" class="btn7">Learn More</button></a>
                    </div>
                    <div class="col-md-4 col-lg-3 col1 y1"><img src="./assets/images/d-3.png" alt="d1" class="d1" />
                        <h4 class="k">Automated Workflow</h4>
                        <p class="l"><span style="font-weight: 600;"> Streamline Your Process with Automated Workflow.
                            </span> <br> Say goodbye to manual tasks and hello to a more efficient process with our
                            automated workflow. Our solution allows you to automate repetitive tasks such as sending...
                        </p>
                        <a href="{{ route('automated-workflow') }}"><button type="button" class="btn7">Learn More</button></a>
                    </div>
                    <div class="col-md-3"></div>
                    <div class="col-md-3"></div>
                    <a href="{{ route('service') }}" class="btn88"><button class="btn8">View All</button></a>
                </div>
            </div>
        </div>
    </section>
    <section class="bg5">
        <div class="container">
            <div class="row">
                <div class="col-md-6" id="g-3">
                    <form class="row g-3">
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
                            <button type="submit" class="btn9">Get In Touch</button>
                        </div>
                    </form>
                </div>
                <div class="col-md-6 align-self-center m1">
                    <h4 class="m" style="margin-bottom: 15px;">Let's make document signing easy!</h4>
                    <h3 class="n">Get in touch <span class="span3">Today!</span></h3>
                    <p class="o">Let's connect to make your document flow faster. Optimize your time by automating your
                        workflow to create seamless processes for proposals, quotes, sales contracts, and more.</p>
                    <div class="row">
                        <div class="col-md-5">
                            <div class="m2">
                                <img src="./assets/images/envelope.jpg" alt="env" class="envelope">
                                <h4 class="p">Email Address</h4>
                                <h5 class="q">x-y-z@support.com</h5>
                            </div>
                        </div>
                        <div class="col-md-5">
                            <div class="m2">
                                <img src="./assets/images/phone.jpg" alt="phone" class="phone">
                                <h4 class="p">Phone</h4>
                                <h5 class="q">+80 1789 1456 456</h5>
                            </div>
                        </div>
                        <div class="col-md-2"></div>
                    </div>
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
                                                recommend this company to anyone looking to streamline their document
                                                management.
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
                                                much more productive I've become since switching to this firm.
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
                                            <p class="s">Our team has been using their CRM for a few months now, and it
                                                has been a total game-changer. The automated workflow has reduced the
                                                time it takes to close a deal, and the real-time notifications keep us
                                                in the know. The integration with our CRM has also made our process more
                                                efficient. We couldn't be happier with our decision to switch to them.
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