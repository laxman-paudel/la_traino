import { useState, useEffect, useCallback } from "react";
import {
  getDietTemplates, createDietTemplate, updateDietTemplate, deleteDietTemplate,
  duplicateDietTemplate, archiveDietTemplate, restoreDietTemplate, toggleDietFavorite,
} from "../../api/dietTemplates";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import { SkeletonCard } from "../../components/Skeleton";
import DietTemplateCard from "../../components/DietTemplateCard";
import DietTemplateForm from "../../components/DietTemplateForm";
import DietTemplatePreview from "../../components/DietTemplatePreview";
import AssignDietTemplateModal from "../../components/AssignDietTemplateModal";

export default function DietTemplatesPage() {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [formModal, setFormModal] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [assignTemplate, setAssignTemplate] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTemplates = useCallback(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (showArchived) params.archived = true;
    else params.archived = false;
    if (showFavorites) params.favorited = true;

    getDietTemplates(params)
      .then((res) => setTemplates(res.data))
      .catch(() => addToast("Failed to load diet templates", "error"))
      .finally(() => setLoading(false));
  }, [debouncedSearch, showArchived, showFavorites, addToast]);

  useEffect(() => {
    setLoading(true);
    fetchTemplates();
  }, [fetchTemplates]);

  async function handleSave(data) {
    try {
      if (formModal === "add") {
        const res = await createDietTemplate(data);
        setTemplates((prev) => [res.data, ...prev]);
        addToast("Diet template created", "success");
      } else {
        const res = await updateDietTemplate(formModal.id, data);
        setTemplates((prev) => prev.map((t) => (t.id === formModal.id ? res.data : t)));
        addToast("Diet template updated", "success");
      }
      setFormModal(null);
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to save template", "error");
    }
  }

  async function handleDuplicate(t) {
    try {
      const res = await duplicateDietTemplate(t.id);
      setTemplates((prev) => [res.data, ...prev]);
      addToast("Diet template duplicated", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to duplicate", "error");
    }
  }

  async function handleArchive(t) {
    try {
      const res = await archiveDietTemplate(t.id);
      setTemplates((prev) => prev.map((x) => (x.id === t.id ? res.data : x)));
      addToast("Diet template archived", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to archive", "error");
    }
  }

  async function handleRestore(t) {
    try {
      const res = await restoreDietTemplate(t.id);
      setTemplates((prev) => prev.map((x) => (x.id === t.id ? res.data : x)));
      addToast("Diet template restored", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to restore", "error");
    }
  }

  async function handleToggleFavorite(t) {
    try {
      const res = await toggleDietFavorite(t.id);
      setTemplates((prev) => prev.map((x) => (x.id === t.id ? res.data : x)));
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to update favorite", "error");
    }
  }

  async function handleDelete(id) {
    setDeleting(true);
    try {
      await deleteDietTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setDeleteTarget(null);
      addToast("Diet template deleted", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to delete", "error");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diet Templates"
        subtitle="Build meal plans once, assign to many"
        actions={
          <button type="button" onClick={() => setFormModal("add")}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold shadow-sm shadow-indigo-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Diet Template
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search diet templates..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "Active", active: !showArchived && !showFavorites, onClick: () => { setShowArchived(false); setShowFavorites(false); } },
          { key: "favorites", label: "Favorites", active: showFavorites, onClick: () => { setShowFavorites(!showFavorites); setShowArchived(false); } },
          { key: "archived", label: "Archived", active: showArchived, onClick: () => { setShowArchived(!showArchived); setShowFavorites(false); } },
        ].map((chip) => (
          <button key={chip.key} type="button" onClick={chip.onClick}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              chip.active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
            }`}>{chip.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} rows={4} />)}
        </div>
      ) : templates.length === 0 ? (
        <EmptyState icon="clipboard" title={search || showArchived ? "No matching templates" : "No Diet Templates"}
          message="Create your first reusable diet template."
          action={!search && !showArchived ? (
            <button type="button" onClick={() => setFormModal("add")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold">Create Template</button>
          ) : null}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <DietTemplateCard key={t.id} template={t}
              onPreview={setPreviewTemplate} onEdit={(tpl) => setFormModal({ type: "edit", id: tpl.id, template: tpl })}
              onDuplicate={handleDuplicate} onAssign={setAssignTemplate}
              onArchive={handleArchive} onRestore={handleRestore} onDelete={setDeleteTarget}
              onToggleFavorite={handleToggleFavorite} />
          ))}
        </div>
      )}

      {previewTemplate && <DietTemplatePreview template={previewTemplate} onClose={() => setPreviewTemplate(null)} />}
      {formModal && <DietTemplateForm template={formModal === "add" ? null : formModal.template} onSave={handleSave} onClose={() => setFormModal(null)} />}
      {assignTemplate && <AssignDietTemplateModal template={assignTemplate} isOpen={!!assignTemplate} onClose={() => setAssignTemplate(null)} onComplete={() => addToast("Diet assigned successfully", "success")} />}
      <ConfirmDialog open={!!deleteTarget} title="Delete Diet Template" message={deleteTarget ? `Delete "${deleteTarget.name}"?` : ""}
        confirmLabel={deleting ? "Deleting..." : "Delete"} cancelLabel="Cancel" danger
        onConfirm={() => handleDelete(deleteTarget.id)} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
