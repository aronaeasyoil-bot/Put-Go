"use client";

import { useEffect, useMemo, useState } from "react";
import { canPublish, computeIssues, parseSourceFile, reconcile, type DraftIssue, type DraftProduct, type SourceKind, type SourceRecord } from "@/lib/import";

const ISSUE_LABEL: Record<DraftIssue, string> = {
  missing_title: "Nom manquant",
  missing_price: "Prix manquant",
  missing_currency: "Devise manquante",
  missing_images: "Photo manquante",
  missing_department: "Rayon manquant",
  missing_sizes: "Tailles manquantes",
  price_conflict: "Prix différents selon la source",
  currency_mismatch: "Devise ≠ devise boutique",
  stale_price: "Prix publié il y a longtemps : à reconfirmer",
};

const STORE_KEY = "pg_import_drafts";
const TOKEN_KEY = "pg_import_token";
const DEPTS = ["women", "men", "kids", "shoes", "accessories"];

export function ImportReview() {
  const [records, setRecords] = useState<SourceRecord[]>([]);
  const [drafts, setDrafts] = useState<DraftProduct[]>([]);
  const [token, setToken] = useState("");
  const [base, setBase] = useState("XOF");
  const [status, setStatus] = useState<string>("");
  const [source, setSource] = useState<SourceKind>("whatsapp");

  useEffect(() => {
    try {
      const d = localStorage.getItem(STORE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore reviewer's work in progress
      if (d) setDrafts(JSON.parse(d));
      setToken(sessionStorage.getItem(TOKEN_KEY) ?? "");
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(drafts)); } catch {}
  }, [drafts]);

  const update = (key: string, patch: Partial<DraftProduct>) =>
    setDrafts((ds) =>
      ds.map((d) => {
        if (d.key !== key) return d;
        const next = { ...d, ...patch };
        // any edit resets approval unless the edit is the approval itself
        if (!("approved" in patch)) next.approved = false;
        return { ...next, issues: computeIssues(next, base) };
      }),
    );

  const stats = useMemo(() => ({
    total: drafts.length,
    blocked: drafts.filter((d) => d.issues.some((i) => i !== "stale_price")).length,
    approved: drafts.filter((d) => d.approved).length,
    publishable: drafts.filter(canPublish).length,
  }), [drafts]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const all: SourceRecord[] = [...records];
    for (const f of Array.from(files)) {
      try {
        all.push(...parseSourceFile(await f.text(), f.name, source));
      } catch (e) {
        setStatus(`Fichier ${f.name} illisible : ${String(e)}`);
      }
    }
    setRecords(all);
    setDrafts(reconcile(all, base));
    setStatus(`${all.length} enregistrements sources → ${reconcile(all, base).length} brouillons (doublons fusionnés).`);
  };

  const publish = async () => {
    const ready = drafts.filter(canPublish);
    if (!ready.length) return setStatus("Aucun brouillon approuvé et complet.");
    setStatus("Envoi vers Shopify (statut BROUILLON)…");
    const r = await fetch("/api/admin/import/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ drafts: ready.slice(0, 50) }),
    });
    const body = (await r.json().catch(() => ({}))) as { results?: { key: string; ok: boolean; error?: string }[]; error?: string };
    if (!r.ok) return setStatus(`Échec : ${body.error ?? r.status}`);
    const ok = body.results?.filter((x) => x.ok).length ?? 0;
    const failed = body.results?.filter((x) => !x.ok) ?? [];
    setStatus(`${ok} produit(s) créé(s) en brouillon dans Shopify. ${failed.length ? `Échecs : ${failed.map((f) => `${f.key} (${f.error})`).join(", ")}` : ""}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-2 border-b border-line pb-6">
        <h1 className="font-display text-4xl">Import catalogue — revue</h1>
        <p className="max-w-3xl text-sm text-stone">
          Importez les exports fournis par PUT & GO (CSV ou JSON) issus du catalogue WhatsApp Business et d’Instagram.
          Les doublons sont fusionnés, les prix divergents et informations manquantes sont signalés. Seuls les brouillons
          approuvés et complets sont envoyés à Shopify, en statut <strong>BROUILLON</strong> : l’activation finale se fait dans Shopify Admin.
        </p>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="eyebrow">Jeton d’administration</span>
          <input type="password" value={token} onChange={(e) => { setToken(e.target.value); try { sessionStorage.setItem(TOKEN_KEY, e.target.value); } catch {} }} className="border border-line bg-white px-3 py-2" autoComplete="off" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="eyebrow">Devise de la boutique Shopify</span>
          <input value={base} onChange={(e) => setBase(e.target.value.toUpperCase())} className="border border-line bg-white px-3 py-2" />
        </label>
        <div className="flex flex-col gap-1 text-sm">
          <span className="eyebrow">Fichiers sources</span>
          <div className="flex gap-2">
            <select value={source} onChange={(e) => setSource(e.target.value as SourceKind)} className="border border-line bg-white px-2">
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="manual">Manuel</option>
            </select>
            <input type="file" multiple accept=".csv,.json,text/csv,application/json" onChange={(e) => onFiles(e.target.files)} className="text-sm" />
          </div>
        </div>
      </section>

      <details className="mb-8 border border-line bg-white p-4 text-sm">
        <summary className="cursor-pointer font-medium">Format attendu</summary>
        <p className="mt-3 text-stone">Colonnes reconnues (FR ou EN) : source, source_url, source_id, title/nom, description, price/prix, currency/devise, sizes/tailles, colors/couleurs, category/rayon, subcategory/type, images (URLs séparées par « | »), videos, published_at.</p>
        <pre className="mt-3 overflow-x-auto bg-cream p-3 text-xs">{`source,source_url,title,price,currency,sizes,colors,category,images,published_at
whatsapp,https://wa.me/p/XXXX/221776601327,Robe ...,25000,XOF,S|M|L,Noir,femme,https://.../photo1.jpg,2026-11-01`}</pre>
      </details>

      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
        <span>{stats.total} brouillons</span>
        <span className="text-red-700">{stats.blocked} à compléter</span>
        <span>{stats.approved} approuvés</span>
        <span className="text-emerald-700">{stats.publishable} prêts</span>
        <button type="button" onClick={publish} className="ms-auto bg-ink px-5 py-2.5 text-white disabled:opacity-40" disabled={!stats.publishable || !token}>Envoyer vers Shopify (brouillons)</button>
        <button type="button" onClick={() => { const blob = new Blob([JSON.stringify(drafts, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "put-and-go-brouillons.json"; a.click(); }} className="border border-ink px-4 py-2.5">Exporter JSON</button>
        <button type="button" onClick={() => { if (confirm("Vider la liste ?")) { setDrafts([]); setRecords([]); } }} className="text-stone underline">Vider</button>
      </div>
      {status && <p role="status" className="mb-6 bg-cream p-3 text-sm">{status}</p>}

      <ul className="space-y-4">
        {drafts.map((d) => (
          <li key={d.key} className="grid gap-4 border border-line bg-white p-4 md:grid-cols-[140px_1fr]">
            <div className="flex gap-1 overflow-x-auto md:flex-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {d.images.slice(0, 3).map((src) => <img key={src} src={src} alt="" className="h-36 w-28 shrink-0 bg-cream object-cover" loading="lazy" />)}
              {!d.images.length && <div className="grid h-36 w-28 place-items-center bg-cream text-xs text-stone">Sans photo</div>}
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-4">
                <input value={d.title} onChange={(e) => update(d.key, { title: e.target.value })} placeholder="Nom" className="border border-line px-2 py-1.5 sm:col-span-2" />
                <input value={d.price ?? ""} inputMode="decimal" onChange={(e) => update(d.key, { price: e.target.value ? Number(e.target.value) : undefined })} placeholder="Prix" className="border border-line px-2 py-1.5" />
                <input value={d.currency ?? ""} onChange={(e) => update(d.key, { currency: e.target.value.toUpperCase() || undefined })} placeholder="Devise" className="border border-line px-2 py-1.5" />
                <select value={d.department ?? ""} onChange={(e) => update(d.key, { department: e.target.value || undefined })} className="border border-line px-2 py-1.5">
                  <option value="">Rayon…</option>
                  {DEPTS.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
                <input value={d.subcategory ?? ""} onChange={(e) => update(d.key, { subcategory: e.target.value || undefined })} placeholder="Type (ex. dresses)" className="border border-line px-2 py-1.5" />
                <input value={d.sizes.join("|")} onChange={(e) => update(d.key, { sizes: e.target.value.split("|").map((s) => s.trim()).filter(Boolean) })} placeholder="Tailles S|M|L" className="border border-line px-2 py-1.5" />
                <input value={d.colors.join("|")} onChange={(e) => update(d.key, { colors: e.target.value.split("|").map((s) => s.trim()).filter(Boolean) })} placeholder="Couleurs" className="border border-line px-2 py-1.5" />
              </div>
              <textarea value={d.description} onChange={(e) => update(d.key, { description: e.target.value })} rows={2} placeholder="Description" className="w-full border border-line px-2 py-1.5" />
              <div className="flex flex-wrap gap-2 text-xs">
                {d.sources.map((s, i) => (
                  <span key={i} className="border border-line px-2 py-1">
                    {s.source}{s.price !== undefined ? ` · ${s.price} ${s.currency ?? ""}` : ""}{s.publishedAt ? ` · ${s.publishedAt.slice(0, 10)}` : ""}
                    {s.url && <> · <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">source</a></>}
                    {d.issues.includes("price_conflict") && s.price !== undefined && (
                      <button type="button" onClick={() => update(d.key, { price: s.price, currency: s.currency })} className="ms-2 underline">utiliser ce prix</button>
                    )}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {d.issues.map((i) => <span key={i} className={`px-2 py-0.5 text-xs ${i === "stale_price" ? "bg-amber-100" : "bg-red-100 text-red-800"}`}>{ISSUE_LABEL[i]}</span>)}
                <label className="ms-auto flex items-center gap-2">
                  <input type="checkbox" checked={d.approved} onChange={(e) => update(d.key, { approved: e.target.checked })} />
                  Prix et informations vérifiés — approuver
                </label>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
