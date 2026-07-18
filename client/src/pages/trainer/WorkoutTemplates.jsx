import { useState, useEffect, useCallback } from "react";
import {
  getTemplates, createTemplate, updateTemplate, deleteTemplate,
  duplicateTemplate, archiveTemplate, restoreTemplate, toggleFavorite,
} from "../../api/templates";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import { SkeletonCard } from "../../components/Skeleton";
import TemplateCard from "../../components/TemplateCard";
import TemplateForm from "../../components/TemplateForm";
import TemplatePreview from "../../components/TemplatePreview";
import AssignTemplateModal from "../../components/AssignTemplateModal";

export default function WorkoutTemplates() {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
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
    if (difficultyFilter) params.difficulty = difficultyFilter;
    if (showArchived) params.archived = true;
    else params.archived = false;
    if (showFavorites) params.favorited = true;

    getTemplates(params)
      .then((res) => setTemplates(res.data))
      .catch(() => addToast("Failed to load templates", "error"))
      .finally(() => setLoading(false));
  }, [debouncedSearch, difficultyFilter, showArchived, showFavorites, addToast]);

  useEffect(() => {
    setLoading(true);
    fetchTemplates();
  }, [fetchTemplates]);

  async function handleSave(data) {
    try {
      if (formModal === "add") {
        const res = await createTemplate(data);
        setTemplates((prev) => [res.data, ...prev]);
        addToast("Template created", "success");
      } else {
        const res = await updateTemplate(formModal.id, data);
        setTemplates((prev) => prev.map((t) => (t.id === formModal.id ? res.data : t)));
        addToast("Template updated", "success");
      }
      setFormModal(null);
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to save template", "error");
    }
  }

  async function handleDuplicate(t) {
    try {
      const res = await duplicateTemplate(t.id);
      setTemplates((prev) => [res.data, ...prev]);
      addToast("Template duplicated", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to duplicate", "error");
    }
  }

  async function handleArchive(t) {
    try {
      const res = await archiveTemplate(t.id);
      setTemplates((prev) => prev.map((x) => (x.id === t.id ? res.data : x)));
      addToast("Template archived", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to archive", "error");
    }
  }

  async function handleRestore(t) {
    try {
      const res = await restoreTemplate(t.id);
      setTemplates((prev) => prev.map((x) => (x.id === t.id ? res.data : x)));
      addToast("Template restored", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to restore", "error");
    }
  }

  async function handleToggleFavorite(t) {
    try {
      const res = await toggleFavorite(t.id);
      setTemplates((prev) => prev.map((x) => (x.id === t.id ? res.data : x)));
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to update favorite", "error");
    }
  }

  async function handleDelete(id) {
    setDeleting(true);
    try {
      await deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setDeleteTarget(null);
      addToast("Template deleted", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to delete", "error");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  function openAdd() {
    setFormModal("add");
  }

  function openEdit(t) {
    setFormModal({ type: "edit", id: t.id, template: t });
  }

  const filterChips = [
    { key: "all", label: "Active", active: !showArchived && !showFavorites, onClick: () => { setShowArchived(false); setShowFavorites(false); } },
    { key: "favorites", label: "Favorites", active: showFavorites, onClick: () => { setShowFavorites(!showFavorites); setShowArchived(false); } },
    { key: "archived", label: "Archived", active: showArchived, onClick: () => { setShowArchived(!showArchived); setShowFavorites(false); } },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workout Templates"
        subtitle="Build once, assign to many"
        actions={
          <button type="button" onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold shadow-sm shadow-indigo-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Template
          </button>
        }
      />

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
        </div>
        <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-700">
          <option value="">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {filterChips.map((chip) => (
          <button key={chip.key} type="button" onClick={chip.onClick}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              chip.active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
            }`}>
            {chip.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} rows={4} />)}
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon="dumbbell"
          title={search || difficultyFilter || showArchived ? "No matching templates" : "No Workout Templates"}
          message={search || difficultyFilter || showArchived ? "Try different search terms or filters." : "Create your first reusable workout template."}
          action={
            !search && !difficultyFilter && !showArchived ? (
              <button type="button" onClick={openAdd}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold">
                Create Template
              </button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onPreview={setPreviewTemplate}
              onEdit={openEdit}
              onDuplicate={handleDuplicate}
              onAssign={setAssignTemplate}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onDelete={setDeleteTarget}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewTemplate && (
        <TemplatePreview template={previewTemplate} onClose={() => setPreviewTemplate(null)} />
      )}

      {/* Create/Edit modal */}
      {formModal && (
        <TemplateForm
          template={formModal === "add" ? null : formModal.template}
          onSave={handleSave}
          onClose={() => setFormModal(null)}
        />
      )}

      {/* Assign modal */}
      {assignTemplate && (
        <AssignTemplateModal
          template={assignTemplate}
          isOpen={!!assignTemplate}
          onClose={() => setAssignTemplate(null)}
          onComplete={() => addToast("Template assigned successfully", "success")}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Template"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.` : ""}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        danger
        onConfirm={() => handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
