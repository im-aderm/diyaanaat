'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  ShieldCheck, ClipboardList, MessageSquare, Calendar, Truck,
  Users, GraduationCap, Building2, ChevronDown, Mail, Phone, MapPin,
  Globe, Share2, CalendarDays, CheckCircle, AlertTriangle, ArrowUpRight, Search, Check, X,
  Upload, Image, FileText
} from 'lucide-react';

interface State {
  id: string;
  name: string;
  code: string;
}

interface Lga {
  id: string;
  name: string;
}

export default function LandingPage() {
  const [form, setForm] = useState({
    type: 'INDIVIDUAL',
    fullName: '',
    phoneNumber: '',
    address: '',
    stateId: '',
    lgaId: '',
    vulnerabilityCategory: '',
    organizationType: '',
    organizationName: '',
    guarantorName: '',
    guarantorPhone: '',
    requestedSlots: 1,
    isFirstTime: true,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<Lga[]>([]);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registerModal, setRegisterModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<{ isOpen: boolean }>('/sessions/public/status')
      .then((res: any) => setRegistrationOpen(res?.isOpen || false))
      .catch(() => {});
    api.get<State[]>('/states').then(setStates).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.stateId) {
      api.get<Lga[]>(`/states/${form.stateId}/lgas`).then(setLgas).catch(() => {});
    } else {
      setLgas([]);
    }
  }, [form.stateId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result: any = await api.post('/beneficiaries/register', form);
      const beneficiaryId = result?.id;

      if (beneficiaryId && selectedFiles.length > 0) {
        setUploading(true);
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('files', file));
        formData.append('category', 'previous_collection');
        formData.append('beneficiaryId', beneficiaryId);

        const uploadResult: any = await api.uploadMultipleFiles('/upload/public/multiple', formData);
        if (uploadResult?.errors?.length > 0) {
          console.warn('Some files failed to upload:', uploadResult.errors);
        }
        setUploading(false);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans">
      {/* ===== HEADER ===== */}
      <header className="bg-surface sticky top-0 z-50 shadow-sm border-b border-outline-variant">
        <div className="flex justify-between items-center px-4 md:px-container-padding-desktop py-4 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/">
              <img src="/logo.png" alt="Türkiye Diyanet Vakfı" className="h-10 w-auto" />
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6 xl:gap-8">
            <a href="#program" className="text-primary font-semibold border-b-2 border-primary pb-1 text-sm">
              Programs
            </a>
            <a href="#process" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">
              Process
            </a>
            <a href="#timeline" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">
              Timeline
            </a>
            <a href="#faq" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              Staff Login
            </Link>
            <button
              onClick={() => setRegisterModal(true)}
              className="bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 active:scale-95 transition-all"
            >
              Register Now
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ===== HERO ===== */}
        <section className="relative h-[600px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img className="w-full h-full object-cover" src="/hero-bg.jpg" alt="Humanitarian aid workers distributing supplies in a bright outdoor community setting" />
          </div>
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/70 to-transparent" />
          <div className="relative z-10 px-4 md:px-container-padding-desktop max-w-4xl text-on-primary">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight">
              Humanitarian Compassion through Official Stewardship
            </h1>
            <p className="text-base md:text-lg mb-10 text-white/90 max-w-2xl leading-relaxed">
              The Türkiye Diyanet Foundation Qurbani Program ensures the professional and ritual-compliant distribution of sacrifice meat to those in need, upholding the highest standards of administrative excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setRegisterModal(true)}
                className="bg-primary text-on-primary px-8 py-4 rounded-lg text-base font-semibold hover:bg-primary-container transition-colors shadow-lg"
              >
                Register for 2026 Distribution
              </button>
              <a
                href="#program"
                className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-lg text-base font-semibold hover:bg-white/20 transition-colors text-center"
              >
                View Program Details
              </a>
            </div>
          </div>
        </section>

        {/* ===== PROGRAM OVERVIEW ===== */}
        <section id="program" className="py-section-gap px-4 md:px-container-padding-desktop">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
              <div className="md:col-span-8 bg-surface-container-low p-6 md:p-8 rounded-xl border border-outline-variant">
                <span className="text-primary font-bold text-xs uppercase tracking-wider block mb-2">The Mission</span>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">The Religious &amp; Humanitarian Significance</h2>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  The Qurbani Program is more than a logistical operation; it is a manifestation of religious devotion and communal solidarity. Under the supervision of the Türkiye Diyanet Foundation, we bridge the gap between donors and eligible recipients, ensuring that every contribution reaches its intended destination with dignity and transparency.
                </p>
              </div>
              <div className="md:col-span-4 bg-primary p-6 md:p-8 rounded-xl text-on-primary flex flex-col justify-center items-center text-center">
                <ShieldCheck className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Diyanet Supervised</h3>
                <p className="text-sm opacity-90">Official oversight by the Türkiye Diyanet Foundation ensures ritual compliance and fair distribution across all regions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section id="process" className="bg-surface-container-lowest py-section-gap px-4 md:px-container-padding-desktop border-y border-outline-variant">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Seamless 4-Step Process</h2>
              <p className="text-base text-on-surface-variant">Simple, transparent, and digitally managed for your convenience.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {[
                { step: 1, Icon: ClipboardList, title: 'Register', desc: 'Complete the online registration form with valid identification documents.' },
                { step: 2, Icon: MessageSquare, title: 'SMS Approval', desc: 'Receive a confirmation SMS with your unique distribution token after vetting.' },
                { step: 3, Icon: Calendar, title: 'Schedule', desc: 'Select your preferred pick-up time slot and location through our portal.' },
                { step: 4, Icon: Truck, title: 'Collect', desc: 'Visit the assigned logistics center and present your token to collect your share.' },
              ].map(({ step, Icon, title, desc }) => (
                <div key={step} className="relative group">
                  <div className="bg-surface p-6 rounded-xl border border-outline-variant hover:border-primary transition-colors h-full">
                    <div className="w-12 h-12 bg-primary-container text-on-primary rounded-full flex items-center justify-center mb-5 text-xl font-bold">{step}</div>
                    <Icon className="w-8 h-8 text-primary mb-3" />
                    <h4 className="text-lg font-semibold mb-2">{title}</h4>
                    <p className="text-sm text-on-surface-variant">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== ELIGIBILITY ===== */}
        <section className="py-section-gap px-4 md:px-container-padding-desktop">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">Eligibility Criteria</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { Icon: Users, title: 'Vulnerable Families', desc: 'Households identified through national welfare databases as high-priority recipients.' },
                { Icon: GraduationCap, title: 'Educational Support', desc: 'Students and educational institutions serving low-income communities.' },
                { Icon: Building2, title: 'Registered NGOs', desc: 'Partner humanitarian organizations authorized to facilitate broader community reach.' },
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-surface-container flex items-center justify-center rounded-lg mb-6">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{title}</h3>
                  <p className="text-base text-on-surface-variant">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TIMELINE ===== */}
        <section id="timeline" className="bg-inverse-surface text-on-primary py-section-gap px-4 md:px-container-padding-desktop">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">2026 Program Timeline</h2>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 md:before:mx-auto before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline before:to-transparent">
              {[
                { date: 'January 01 — August 31', title: 'Registration Window', desc: 'Beneficiaries must submit all documentation via the online portal.', Icon: CalendarDays },
                { date: 'June 01 — June 09', title: 'Vetting &amp; Approval', desc: 'Internal review process and SMS dispatch of collection tokens.', Icon: CheckCircle },
                { date: 'June 10 — June 13', title: 'Distribution Days', desc: 'Simultaneous distribution at all authorized centers nationwide.', Icon: Truck },
              ].map(({ date, title, desc, Icon }) => (
                <div key={title} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-primary bg-primary text-on-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[45%] p-6 rounded-xl bg-surface-container-lowest text-on-surface border border-outline-variant">
                    <time className="text-primary font-bold text-xs uppercase tracking-wider">{date}</time>
                    <h4 className="text-lg font-semibold mt-1">{title}</h4>
                    <p className="text-sm text-on-surface-variant mt-2">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section id="faq" className="py-section-gap px-4 md:px-container-padding-desktop">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Who is eligible to apply?', a: 'The program is open to all eligible vulnerable populations within the designated regions, regardless of nationality. Verification is based on residency and socioeconomic status.' },
                { q: 'What documents are required for registration?', a: 'You will need a valid government-issued ID, proof of residence, and if applicable, documents proving socioeconomic status (e.g., social welfare card).' },
                { q: 'Is there a fee for registration?', a: 'Absolutely not. The Türkiye Diyanet Foundation Qurbani Program is a strictly humanitarian initiative. All services are free of charge.' },
              ].map(({ q, a }) => (
                <details key={q} className="group bg-surface-container p-6 rounded-xl border border-outline-variant open:border-primary transition-all">
                  <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-base">
                    {q}
                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform text-on-surface-variant" />
                  </summary>
                  <p className="mt-4 text-base text-on-surface-variant">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-surface-container-high border-t border-outline-variant py-12 px-4 md:px-container-padding-desktop">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-1">
            <span className="text-sm font-bold text-on-surface block mb-4">Türkiye Diyanet Foundation</span>
            <p className="text-sm text-on-surface-variant">Providing dignified assistance and upholding sacred traditions with administrative integrity.</p>
          </div>
          <div>
            <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4">Contact Us</h5>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> contact@deyaanat.org</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> +234 (0) 800 000 0000</li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Abuja, Nigeria</li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4">Quick Links</h5>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li><Link href="/status" className="hover:text-primary transition-colors">Check Status</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Staff Login</Link></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#program" className="hover:text-primary transition-colors">About</a></li>
            </ul>
          </div>
          <div className="flex flex-col items-center md:items-end justify-center">
            <div className="w-24 h-24 opacity-50 bg-primary/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-on-surface-variant">&copy; {new Date().getFullYear()} Türkiye Diyanet Foundation. All Rights Reserved.</p>
          <div className="flex gap-4">
            <Share2 className="w-4 h-4 text-on-surface-variant hover:text-primary cursor-pointer transition-colors" />
            <Globe className="w-4 h-4 text-on-surface-variant hover:text-primary cursor-pointer transition-colors" />
            <span className="text-xs text-on-surface-variant">TR &middot; EN</span>
          </div>
        </div>
      </footer>

      {/* ===== REGISTRATION MODAL ===== */}
      {registerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setRegisterModal(false)}>
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-surface-container-lowest rounded-t-2xl border-b border-outline-variant px-6 py-4 flex items-center justify-between backdrop-blur-sm">
              <div>
                <h3 className="text-lg font-semibold text-on-surface">Beneficiary Registration</h3>
                <p className="text-xs text-on-surface-variant">Qurbani {new Date().getFullYear()} / 1448 AH</p>
              </div>
              <button onClick={() => setRegisterModal(false)} className="text-on-surface-variant hover:text-on-surface bg-surface-container hover:bg-surface-container-high rounded-lg p-1.5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {!registrationOpen && !success && (
                <div className="bg-error-container text-on-error-container rounded-xl p-4 mb-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Registration is currently closed</p>
                    <p className="text-xs opacity-80 mt-0.5">Please check back when the next session opens for registration.</p>
                  </div>
                </div>
              )}

              {success ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-tertiary-container rounded-full flex items-center justify-center mx-auto mb-5 ring-4 ring-tertiary-container/30">
                    <Check className="w-10 h-10 text-on-tertiary-container" />
                  </div>
                  <p className="font-bold text-xl mb-1">Registration Submitted!</p>
                  <p className="text-sm text-on-surface-variant mb-6 max-w-sm mx-auto">
                    Your application has been received. You will get an SMS notification when it is reviewed.
                  </p>
                  <Link href="/status" className="text-primary text-sm font-semibold hover:underline inline-flex items-center gap-1">
                    Check your status <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      <span className="w-1 h-4 bg-primary rounded-full" />
                      Personal Information
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-on-surface-variant">Registration Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => setForm({ ...form, type: 'INDIVIDUAL' })}
                            className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                              form.type === 'INDIVIDUAL'
                                ? 'border-primary bg-primary-container/20 text-primary ring-1 ring-primary/30'
                                : 'border-outline-variant text-on-surface-variant hover:border-primary/50'
                            }`}>Individual</button>
                          <button type="button" onClick={() => setForm({ ...form, type: 'ORGANIZATION' })}
                            className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                              form.type === 'ORGANIZATION'
                                ? 'border-primary bg-primary-container/20 text-primary ring-1 ring-primary/30'
                                : 'border-outline-variant text-on-surface-variant hover:border-primary/50'
                            }`}>Organization</button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-on-surface-variant">Full Name <span className="text-error">*</span></label>
                        <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required
                          placeholder="Enter full name"
                          className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm bg-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-on-surface-variant">Phone Number <span className="text-error">*</span></label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant">+234</span>
                          <input type="tel" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required
                            placeholder="8000000000"
                            className="w-full rounded-lg border border-outline-variant pl-14 pr-3 py-2.5 text-sm bg-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-on-surface-variant">Meat Slots <span className="text-error">*</span></label>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setForm({ ...form, requestedSlots: Math.max(1, form.requestedSlots - 1) })}
                            className="w-9 h-9 rounded-lg border border-outline-variant flex items-center justify-center text-sm hover:bg-surface-container transition-colors">−</button>
                          <input type="number" value={form.requestedSlots} onChange={(e) => setForm({ ...form, requestedSlots: parseInt(e.target.value) || 1 })} min={1} max={10}
                            className="w-full text-center rounded-lg border border-outline-variant px-2 py-2.5 text-sm font-semibold bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow" />
                          <button type="button" onClick={() => setForm({ ...form, requestedSlots: Math.min(10, form.requestedSlots + 1) })}
                            className="w-9 h-9 rounded-lg border border-outline-variant flex items-center justify-center text-sm hover:bg-surface-container transition-colors">+</button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-on-surface-variant">Full Address <span className="text-error">*</span></label>
                      <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required rows={2}
                        placeholder="Enter your full residential address"
                        className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm bg-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow resize-none" />
                    </div>
                  </div>

                  {/* Location Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      <span className="w-1 h-4 bg-primary rounded-full" />
                      Location
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-on-surface-variant">State <span className="text-error">*</span></label>
                        <select value={form.stateId} onChange={(e) => setForm({ ...form, stateId: e.target.value, lgaId: '' })} required
                          className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow">
                          <option value="">Select state</option>
                          {states.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-on-surface-variant">LGA <span className="text-error">*</span></label>
                        <select value={form.lgaId} onChange={(e) => setForm({ ...form, lgaId: e.target.value })} required
                          className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow">
                          <option value="">Select LGA</option>
                          {lgas.map((l) => (<option key={l.id} value={l.id}>{l.name}</option>))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-on-surface-variant">Vulnerability Category</label>
                      <select value={form.vulnerabilityCategory} onChange={(e) => setForm({ ...form, vulnerabilityCategory: e.target.value })}
                        className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow">
                        <option value="">Prefer not to say</option>
                        <option value="WIDOW">Widow</option>
                        <option value="ORPHAN">Orphan</option>
                        <option value="ELDERLY">Elderly</option>
                        <option value="DISPLACED">Internally Displaced</option>
                        <option value="LOW_INCOME">Low Income</option>
                      </select>
                    </div>
                  </div>

                  {/* Organization Section */}
                  {form.type === 'ORGANIZATION' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        <span className="w-1 h-4 bg-primary rounded-full" />
                        Organization Details
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-on-surface-variant">Organization Type <span className="text-error">*</span></label>
                        <select value={form.organizationType} onChange={(e) => setForm({ ...form, organizationType: e.target.value })} required
                          className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow">
                          <option value="">Select type</option>
                          <option value="SCHOOL">School</option>
                          <option value="MASJID">Masjid</option>
                          <option value="NGO">NGO</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-on-surface-variant">Organization Name <span className="text-error">*</span></label>
                        <input type="text" value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} required
                          placeholder="Enter organization name"
                          className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm bg-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow" />
                      </div>
                    </div>
                  )}

                  {/* Verification Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      <span className="w-1 h-4 bg-primary rounded-full" />
                      Verification
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setForm({ ...form, isFirstTime: true })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          form.isFirstTime
                            ? 'border-primary bg-primary-container/10'
                            : 'border-outline-variant hover:border-outline'
                        }`}>
                        <p className="text-sm font-semibold">First Time</p>
                        <p className="text-xs text-on-surface-variant mt-1">Requires guarantor details</p>
                      </button>
                      <button type="button" onClick={() => setForm({ ...form, isFirstTime: false })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          !form.isFirstTime
                            ? 'border-primary bg-primary-container/10'
                            : 'border-outline-variant hover:border-outline'
                        }`}>
                        <p className="text-sm font-semibold">Returning</p>
                        <p className="text-xs text-on-surface-variant mt-1">Upload past collection photo</p>
                      </button>
                    </div>

                    {form.isFirstTime && (
                      <div className="bg-surface-container-low rounded-xl p-4 space-y-3 border border-outline-variant animate-in">
                        <p className="text-xs font-medium text-on-surface">Guarantor Information</p>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder="Guarantor Name *" value={form.guarantorName} onChange={(e) => setForm({ ...form, guarantorName: e.target.value })} required
                            className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm bg-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow" />
                          <input type="tel" placeholder="Guarantor Phone *" value={form.guarantorPhone} onChange={(e) => setForm({ ...form, guarantorPhone: e.target.value })} required
                            className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm bg-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow" />
                        </div>
                      </div>
                    )}

                    {!form.isFirstTime && (
                      <div className="bg-surface-container-low rounded-xl p-4 space-y-3 border border-outline-variant animate-in">
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4 text-primary" />
                          <p className="text-sm font-medium text-on-surface">Previous Collection Photos</p>
                        </div>
                        <p className="text-xs text-on-surface-variant">Upload photos from your last Qurbani collection.</p>
                        <div onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-outline-variant rounded-xl p-5 text-center hover:border-primary hover:bg-primary-container/5 transition-all cursor-pointer group">
                          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-2 group-hover:bg-primary-container/20 transition-colors">
                            <Upload className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
                          </div>
                          <p className="text-xs font-medium text-on-surface-variant">Click to browse photos</p>
                          <p className="text-[10px] text-on-surface-variant/60 mt-0.5">JPG, PNG, WebP — max 5MB each</p>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileSelect} className="hidden" />
                        {selectedFiles.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-xs font-medium text-on-surface-variant">{selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected</p>
                            {selectedFiles.map((file, i) => (
                              <div key={i} className="flex items-center justify-between bg-surface px-3 py-2 rounded-lg border border-outline-variant">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Image className="w-4 h-4 text-primary shrink-0" />
                                  <span className="text-xs text-on-surface truncate">{file.name}</span>
                                  <span className="text-[10px] text-on-surface-variant/70 shrink-0">({(file.size / 1024).toFixed(0)} KB)</span>
                                </div>
                                <button type="button" onClick={() => removeFile(i)}
                                  className="text-on-surface-variant hover:text-error transition-colors shrink-0 ml-2 p-0.5"><X className="w-3.5 h-3.5" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="bg-error-container text-on-error-container text-sm p-3 rounded-xl flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />{error}
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary/20">
                    {loading || uploading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        {uploading ? 'Uploading photos...' : 'Submitting...'}
                      </span>
                    ) : 'Submit Registration'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
