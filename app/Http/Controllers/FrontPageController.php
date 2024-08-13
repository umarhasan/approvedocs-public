<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FrontPageController extends Controller
{
    // index
    public function index()
    {
        return view('index');
    }
    // about_us
    public function about_us()
    {
        return view('front.about_us');
    }
    // accounts
    public function accounts()
    {
        return view('front.accounts');
    }

    // automated-workflow
    public function automated_workflow()
    {
        return view('front.automated-workflow');
    }
    // blog
    public function blog()
    {
        return view('front.blog');
    }
    // careers
    public function careers()
    {
        return view('front.careers');
    }
    // contactus
    public function contact_us()
    {
        return view('front.contactus');
    }
    // document-management
    public function document_management()
    {
        return view('front.document-management');
    }
    // email-crm-integration
    public function email_crm_integration()
    {
        return view('front.email-crm-integration');
    }
    // E-Signature
    public function E_Signature()
    {
        return view('front.e-signature');
    }
    // faq
    public function faq()
    {
        return view('front.faq');
    }
    // feedback
    public function feedback()
    {
        return view('front.feedback');
    }
    // fillable-pdf
    public function fillable_pdf()
    {
        return view('front.fillable-pdf');
    }
    // helpdesk
    public function helpdesk()
    {
        return view('front.helpdesk');
    }
    // job-details
    public function job_details()
    {
        return view('front.job-details');
    }
    // news
    public function news()
    {
        return view('front.news');
    }
    // privacy-policy
    public function privacy_policy()
    {
        return view('front.privacy-policy');
    }
    // proposal-templates
    public function proposal_templates()
    {
        return view('front.proposal-templates');
    }
    // service
    public function service()
    {
        return view('front.service');
    }
    // term-of-service
    public function term_of_service()
    {
        return view('front.term-of-service');
    }
}
