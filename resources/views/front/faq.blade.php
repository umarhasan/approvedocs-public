@extends('front.layouts.app')
@section('content')
    <section class="bg1ab">
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-1"></div>
                <div class="col-md-10">
                    <h1 class="ax">Frequently Asked <span class="faq-back"> Question</span></h1>
                </div>
                <div class="col-md-1"></div>
            </div>
        </div>
    </section>
    <section class="faq1">
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <h2 class="how">
                        How can we help you?
                    </h2>
                </div>
                <div class="col-md-12">
                    <form method="#" action="#">
                        <div class="search">
                            <input type="text" class="form-control" placeholder="Type Keywords To Find Answers">
                            <button type="submit" class="search-btn"><i class="fa fa-search"></i></button>
                        </div>
                    </form>
                </div>
                <div class="col-md-12">
                    <div class="tab">
                        <button class="tablinks" onclick="openTab(event, 'general')" id="defaultOpen">General </button>
                        <button class="tablinks" onclick="openTab(event, 'accounts')">Accounts</button>
                        <button class="tablinks" onclick="openTab(event, 'sales')">Sales</button>
                        <button class="tablinks" onclick="openTab(event, 'support')">Support</button>
                        <button class="tablinks" onclick="openTab(event, 'license')">License</button>
                        <button class="tablinks" onclick="openTab(event, 'refund')">Refund</button>
                    </div>

                    <div id="general" class="tabcontent general1">
                        <div class="accordion" id="accordionExample">
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingOne">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                        What is your platform and how does it work?
                                    </button>
                                </h2>
                                <div id="collapseOne" class="accordion-collapse collapse show"
                                    aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                    <div class="accordion-body">
                                        Our platform is a cloud-based document management solution that allows you to
                                        create, send, and manage professional documents online. You can customize your
                                        documents with your brand elements, add signatures, and collaborate with team
                                        members.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingTwo">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                        What types of documents can I create and send using your platform?
                                    </button>
                                </h2>
                                <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo"
                                    data-bs-parent="#accordionExample">
                                    <div class="accordion-body">
                                        You can create and send a wide range of documents, including proposals,
                                        contracts, letters, and agreements.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingThree">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseThree" aria-expanded="false"
                                        aria-controls="collapseThree">
                                        Is my data secure on your platform?
                                    </button>
                                </h2>
                                <div id="collapseThree" class="accordion-collapse collapse"
                                    aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                                    <div class="accordion-body">
                                        Yes, we use industry-standard security measures, such as encryption and secure
                                        data storage, to protect your data.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingFour">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseFour" aria-expanded="false"
                                        aria-controls="collapseFour">
                                        What payment methods do you accept?
                                    </button>
                                </h2>
                                <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour"
                                    data-bs-parent="#accordionExample">
                                    <div class="accordion-body">
                                        We accept major credit cards, such as Visa, Mastercard, and American Express.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingFive">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseFive" aria-expanded="false"
                                        aria-controls="collapseFive">
                                        What is your pricing model and how do I upgrade or downgrade my subscription
                                        plan?
                                    </button>
                                </h2>
                                <div id="collapseFive" class="accordion-collapse collapse" aria-labelledby="headingFive"
                                    data-bs-parent="#accordionExample">
                                    <div class="accordion-body">
                                        Our pricing is based on the number of users and features you need. You can
                                        upgrade or downgrade your subscription plan at any time from your account
                                        settings.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="accounts" class="tabcontent general1">
                        <div class="accordion" id="accordionExample1">
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingSeven">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseSeven" aria-expanded="true"
                                        aria-controls="collapseSeven">
                                        How do I create an account?
                                    </button>
                                </h2>
                                <div id="collapseSeven" class="accordion-collapse collapse show"
                                    aria-labelledby="headingSeven" data-bs-parent="#accordionExample1">
                                    <div class="accordion-body">
                                        To create an account, go to our website and click on the "Sign Up" button.
                                        Follow the prompts to enter your information and select your subscription plan.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingEight">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseEight" aria-expanded="false"
                                        aria-controls="collapseEight">
                                        How do I update my account information?
                                    </button>
                                </h2>
                                <div id="collapseEight" class="accordion-collapse collapse"
                                    aria-labelledby="headingEight" data-bs-parent="#accordionExample1">
                                    <div class="accordion-body">
                                        You can update your account information, such as your name, email address, and
                                        password, from your account settings.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingNine">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseNine" aria-expanded="false"
                                        aria-controls="collapseNine">
                                        How do I cancel my subscription?
                                    </button>
                                </h2>
                                <div id="collapseNine" class="accordion-collapse collapse" aria-labelledby="headingNine"
                                    data-bs-parent="#accordionExample1">
                                    <div class="accordion-body">
                                        To cancel your subscription, go to your account settings and click on the
                                        "Cancel Subscription" button. Follow the prompts to complete the process.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingTen">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseTen" aria-expanded="false" aria-controls="collapseTen">
                                        How do I update my billing information?
                                    </button>
                                </h2>
                                <div id="collapseTen" class="accordion-collapse collapse" aria-labelledby="headingTen"
                                    data-bs-parent="#accordionExample1">
                                    <div class="accordion-body">
                                        To update your billing information, go to your account settings and click on the
                                        "Billing Information" tab. Enter your new payment details and click "Save."
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingEleven">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseEleven" aria-expanded="false"
                                        aria-controls="collapseEleven">
                                        What happens to my data when I cancel my subscription?
                                    </button>
                                </h2>
                                <div id="collapseEleven" class="accordion-collapse collapse"
                                    aria-labelledby="headingEleven" data-bs-parent="#accordionExample1">
                                    <div class="accordion-body">
                                        If you cancel your subscription, your data will be deleted from our servers
                                        after a certain period. Be sure to download any important documents before
                                        cancelling your subscription.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="sales" class="tabcontent general1">
                        <div class="accordion" id="accordionExample2">
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingThirteen">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseThirteen" aria-expanded="true"
                                        aria-controls="collapseThirteen">
                                        What is the difference between the subscription plans?
                                    </button>
                                </h2>
                                <div id="collapseThirteen" class="accordion-collapse collapse show"
                                    aria-labelledby="headingThirteen" data-bs-parent="#accordionExample2">
                                    <div class="accordion-body">
                                        LOur subscription plans differ in terms of features, number of users, and
                                        document limits. Check out our pricing page for more details.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingForteen">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseForteen" aria-expanded="false"
                                        aria-controls="collapseForteen">
                                        Can I try your platform before committing to a subscription?
                                    </button>
                                </h2>
                                <div id="collapseForteen" class="accordion-collapse collapse"
                                    aria-labelledby="headingForteen" data-bs-parent="#accordionExample2">
                                    <div class="accordion-body">
                                        Yes, we offer a free trial for 14 days. You can sign up on our website and start
                                        using our platform right away.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingFifteen">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseFifteen" aria-expanded="false"
                                        aria-controls="collapseFifteen">
                                        Do you offer discounts for non-profits or educational institutions?
                                    </button>
                                </h2>
                                <div id="collapseFifteen" class="accordion-collapse collapse"
                                    aria-labelledby="headingFifteen" data-bs-parent="#accordionExample2">
                                    <div class="accordion-body">
                                        Yes, we offer discounts for non-profit organizations and educational
                                        institutions. Contact our sales team for more information.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingSixteen">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseSixteen" aria-expanded="false"
                                        aria-controls="collapseSixteen">
                                        Do you offer custom pricing for enterprise customers?
                                    </button>
                                </h2>
                                <div id="collapseSixteen" class="accordion-collapse collapse"
                                    aria-labelledby="headingSixteen" data-bs-parent="#accordionExample2">
                                    <div class="accordion-body">
                                        Yes, we offer custom pricing for enterprise customers who require additional
                                        features or support. Contact our sales team for a quote.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingSeventeen">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseSeventeen" aria-expanded="false"
                                        aria-controls="collapseSeventeen">
                                        Can I change my subscription plan at any time?
                                    </button>
                                </h2>
                                <div id="collapseSeventeen" class="accordion-collapse collapse"
                                    aria-labelledby="headingSeventeen" data-bs-parent="#accordionExample2">
                                    <div class="accordion-body">
                                        Yes, you can change your subscription plan at any time from your account
                                        settings. Your new plan will take effect immediately.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="support" class="tabcontent general1">
                        <div class="accordion" id="accordionExample3">
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingOne">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                        How do I contact your customer support team?
                                    </button>
                                </h2>
                                <div id="collapseOne" class="accordion-collapse collapse show"
                                    aria-labelledby="headingOne" data-bs-parent="#accordionExample3">
                                    <div class="accordion-body">
                                        You can contact our customer support team by email or live chat. We typically
                                        respond to inquiries within 24 hours.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingTwo">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                        What is your response time for support inquiries?
                                    </button>
                                </h2>
                                <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo"
                                    data-bs-parent="#accordionExample3">
                                    <div class="accordion-body">
                                        Our response time depends on the nature of the inquiry and the severity of the
                                        issue. We strive to respond to all inquiries as quickly as possible.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingThree">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseThree" aria-expanded="false"
                                        aria-controls="collapseThree">
                                        Can you help me troubleshoot a technical issue?
                                    </button>
                                </h2>
                                <div id="collapseThree" class="accordion-collapse collapse"
                                    aria-labelledby="headingThree" data-bs-parent="#accordionExample3">
                                    <div class="accordion-body">
                                        Yes, our support team can help you troubleshoot technical issues and provide
                                        guidance on using our platform.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingFour">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseFour" aria-expanded="false"
                                        aria-controls="collapseFour">
                                        Do you offer training resources?
                                    </button>
                                </h2>
                                <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour"
                                    data-bs-parent="#accordionExample3">
                                    <div class="accordion-body">
                                        Yes, we offer training resources, including video tutorials, webinars, and live
                                        training sessions. Check out our training section for more information.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingFive">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseFive" aria-expanded="false"
                                        aria-controls="collapseFive">
                                        How do I provide feedback or suggestions for your platform?
                                    </button>
                                </h2>
                                <div id="collapseFive" class="accordion-collapse collapse" aria-labelledby="headingFive"
                                    data-bs-parent="#accordionExample3">
                                    <div class="accordion-body">
                                        We welcome feedback and suggestions for improving our platform. You can send us
                                        your feedback via email or our support chat.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="license" class="tabcontent general1">
                        <div class="accordion" id="accordionExample4">
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingOne">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                        What is your software licence agreement?
                                    </button>
                                </h2>
                                <div id="collapseOne" class="accordion-collapse collapse show"
                                    aria-labelledby="headingOne" data-bs-parent="#accordionExample4">
                                    <div class="accordion-body">
                                        Our software licence agreement is a legal contract that outlines the terms and
                                        conditions for using our platform.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingTwo">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                        How do I view my licence agreement?
                                    </button>
                                </h2>
                                <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo"
                                    data-bs-parent="#accordionExample4">
                                    <div class="accordion-body">
                                        You can view your licence agreement from your account settings.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingThree">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseThree" aria-expanded="false"
                                        aria-controls="collapseThree">
                                        What are the restrictions of your licence agreement?
                                    </button>
                                </h2>
                                <div id="collapseThree" class="accordion-collapse collapse"
                                    aria-labelledby="headingThree" data-bs-parent="#accordionExample4">
                                    <div class="accordion-body">
                                        Our licence agreement prohibits unauthorised use, copying, or distribution of
                                        our software.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingFour">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseFour" aria-expanded="false"
                                        aria-controls="collapseFour">
                                        How do I renew my licence?
                                    </button>
                                </h2>
                                <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour"
                                    data-bs-parent="#accordionExample4">
                                    <div class="accordion-body">
                                        To renew your licence, simply log in to your account and follow the prompts to
                                        renew your subscription.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingFive">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseFive" aria-expanded="false"
                                        aria-controls="collapseFive">
                                        Can I transfer my licence to another user or company?
                                    </button>
                                </h2>
                                <div id="collapseFive" class="accordion-collapse collapse" aria-labelledby="headingFive"
                                    data-bs-parent="#accordionExample4">
                                    <div class="accordion-body">
                                        You cannot transfer your licence to another user or company without our prior
                                        written consent.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="refund" class="tabcontent general1">
                        <div class="accordion" id="accordionExample5">
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingOne">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                        What is your refund policy?
                                    </button>
                                </h2>
                                <div id="collapseOne" class="accordion-collapse collapse show"
                                    aria-labelledby="headingOne" data-bs-parent="#accordionExample5">
                                    <div class="accordion-body">
                                        Our refund policy allows you to request a refund within 14 days of signing up
                                        for our platform.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingTwo">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                        How do I request a refund?
                                    </button>
                                </h2>
                                <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo"
                                    data-bs-parent="#accordionExample5">
                                    <div class="accordion-body">
                                        To request a refund, contact our customer support team by email or live chat and
                                        provide your account information and reason for the refund.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingThree">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseThree" aria-expanded="false"
                                        aria-controls="collapseThree">
                                        What are the conditions for a refund?
                                    </button>
                                </h2>
                                <div id="collapseThree" class="accordion-collapse collapse"
                                    aria-labelledby="headingThree" data-bs-parent="#accordionExample5">
                                    <div class="accordion-body">
                                        To be eligible for a refund, you must not have used our platform for more than
                                        10 documents and must not have violated our license agreement.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingFour">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseFour" aria-expanded="false"
                                        aria-controls="collapseFour">
                                        How long does it take to receive a refund?
                                    </button>
                                </h2>
                                <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour"
                                    data-bs-parent="#accordionExample5">
                                    <div class="accordion-body">
                                        It typically takes 5-10 business days to process a refund, depending on your
                                        payment method and bank processing times.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingFive">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseFive" aria-expanded="false"
                                        aria-controls="collapseFive">
                                        What happens to my data when I request a refund?
                                    </button>
                                </h2>
                                <div id="collapseFive" class="accordion-collapse collapse" aria-labelledby="headingFive"
                                    data-bs-parent="#accordionExample5">
                                    <div class="accordion-body">
                                        If you have any questions about our refund policy or process, please contact our
                                        customer support team. We're here to help!
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