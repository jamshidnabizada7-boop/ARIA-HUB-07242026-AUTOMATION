'use client';

import { useState } from 'react';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-border/60 bg-card/40 p-10 text-center shadow-sm backdrop-blur-sm">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-green-500/10 text-green-500">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Message Sent!</h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          Thank you for reaching out. Our team will get back to you within 24 hours.
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-2 rounded-lg border border-border/60 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm backdrop-blur-sm md:p-8">
      <h2 className="mb-6 text-xl font-bold text-foreground">Send Us a Message</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-foreground">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={form.name}
              onChange={set('name')}
              className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-foreground">
              Email Address <span className="text-destructive">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={form.email}
              onChange={set('email')}
              className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-foreground">
            Subject
          </label>
          <select
            id="contact-subject"
            value={form.subject}
            onChange={set('subject')}
            className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          >
            <option value="">Select a topic...</option>
            <option value="visa">Visa & Immigration</option>
            <option value="scholarship">Scholarship / Job Opportunities</option>
            <option value="business">Business Consulting</option>
            <option value="support">Technical Support</option>
            <option value="partnership">Partnership</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-foreground">
            Message <span className="text-destructive">*</span>
          </label>
          <textarea
            id="contact-message"
            required
            rows={6}
            value={form.message}
            onChange={set('message')}
            className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
            placeholder="Describe how we can help you..."
          />
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-chart-2 px-6 py-3 font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
