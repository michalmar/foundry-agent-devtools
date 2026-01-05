import { useState, useEffect } from 'react'
import { formatDate } from '../utils'

function getAgentTools(agent) {
  const tools = agent?.versions?.latest?.definition?.tools || []
  if (tools.length === 0) return '—'
  return tools.map(tool => tool.type).join(', ')
}

export function AgentsTable({ 
  agents, 
  loading, 
  selectedAgent, 
  onSelectAgent,
  onDeleteAgent,
  onBulkDeleteAgents,
  mutationLoading,
  mutationError,
  onClearError,
  loadError
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  // Clear selection when agents change
  useEffect(() => {
    setSelectedIds(new Set())
  }, [agents])

  const handleDeleteClick = (e, agent) => {
    e.stopPropagation()
    setDeleteConfirmId(agent.id)
  }

  const handleConfirmDelete = async (e) => {
    e.stopPropagation()
    if (deleteConfirmId) {
      await onDeleteAgent(deleteConfirmId)
      setDeleteConfirmId(null)
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.delete(deleteConfirmId)
        return next
      })
    }
  }

  const handleCancelDelete = (e) => {
    e.stopPropagation()
    setDeleteConfirmId(null)
  }

  const handleCheckboxChange = (e, agentId) => {
    e.stopPropagation()
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(agentId)) {
        next.delete(agentId)
      } else {
        next.add(agentId)
      }
      return next
    })
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(agents.map(a => a.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleBulkDeleteClick = () => {
    setBulkDeleteConfirm(true)
  }

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.size > 0) {
      await onBulkDeleteAgents(Array.from(selectedIds))
      setSelectedIds(new Set())
      setBulkDeleteConfirm(false)
    }
  }

  const handleCancelBulkDelete = () => {
    setBulkDeleteConfirm(false)
  }

  const allSelected = agents.length > 0 && 
    agents.every(a => selectedIds.has(a.id))
  const someSelected = selectedIds.size > 0

  if (agents.length === 0) {
    const isLoading = Boolean(loading)
    return (
      <div className="space-y-3">
        {/* Error displays */}
        {(mutationError || loadError) && (
          <div className="flex items-center justify-end gap-3">
            {mutationError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <span>⚠️ {mutationError}</span>
                <button onClick={onClearError} className="text-red-400 hover:text-red-600">✕</button>
              </div>
            )}
            {loadError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <span>⚠️ {loadError}</span>
              </div>
            )}
          </div>
        )}

        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-10 px-4 py-3"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Model</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Tools</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-600">
                  <div className="inline-flex items-center gap-2" role="status" aria-live="polite">
                    {isLoading && (
                      <span
                        className="inline-block h-4 w-4 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin"
                        aria-hidden="true"
                      />
                    )}
                    <span>{isLoading ? 'Agents loading…' : 'No agents loaded yet.'}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {someSelected && (
            <button
              onClick={handleBulkDeleteClick}
              disabled={mutationLoading}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              🗑️ Delete Selected ({selectedIds.size})
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {mutationError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <span>⚠️ {mutationError}</span>
              <button onClick={onClearError} className="text-red-400 hover:text-red-600">✕</button>
            </div>
          )}
          {loadError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <span>⚠️ {loadError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Delete Confirmation Dialog */}
      {bulkDeleteConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-red-700 text-sm">
            Delete {selectedIds.size} agent{selectedIds.size !== 1 ? 's' : ''}? This cannot be undone.
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCancelBulkDelete}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmBulkDelete}
              disabled={mutationLoading}
              className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md transition-colors"
            >
              {mutationLoading ? 'Deleting...' : `Delete ${selectedIds.size}`}
            </button>
          </div>
        </div>
      )}

      {/* Single Delete Confirmation Dialog */}
      {deleteConfirmId && !bulkDeleteConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-red-700 text-sm">
            Delete agent <span className="font-mono">{agents.find(a => a.id === deleteConfirmId)?.name || deleteConfirmId.slice(0, 20) + '...'}</span>?
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCancelDelete}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={mutationLoading}
              className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md transition-colors"
            >
              {mutationLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Model</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Tools</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agents.slice(0, 20).map(agent => (
              <tr 
                key={agent.id} 
                onClick={() => onSelectAgent(agent)}
                className={`cursor-pointer transition-colors ${
                  selectedAgent?.id === agent.id 
                    ? 'bg-blue-50 hover:bg-blue-100' 
                    : selectedIds.has(agent.id)
                      ? 'bg-orange-50 hover:bg-orange-100'
                      : 'hover:bg-gray-50'
                }`}
              >
                <td className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(agent.id)}
                    onChange={(e) => handleCheckboxChange(e, agent.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{agent.name || 'Unnamed agent'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{agent.versions?.latest?.definition?.model || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{getAgentTools(agent)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatDate(agent.versions?.latest?.created_at * 1000)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => handleDeleteClick(e, agent)}
                    className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    title="Delete agent"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AgentDetail({ agent }) {
  const [showJson, setShowJson] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!agent) {
    return (
      <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
        Select an agent from the table above to view details
      </div>
    )
  }

  const latestVersion = agent.versions?.latest
  const definition = latestVersion?.definition
  const tools = definition?.tools || []
  const metadata = latestVersion?.metadata || {}

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(agent, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (showJson) {
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="p-4 flex justify-between items-center border-b border-gray-200">
          <button
            onClick={() => setShowJson(false)}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            ← Back to Details
          </button>
          <button
            onClick={handleCopyJson}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            {copied ? '✓ Copied!' : 'Copy JSON'}
          </button>
        </div>
        <pre className="p-4 text-xs overflow-auto max-h-[600px] bg-gray-50">
          {JSON.stringify(agent, null, 2)}
        </pre>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-baseline gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
          <span className="text-sm text-gray-500">version: {latestVersion?.version || '—'}</span>
        </div>
        <button
          onClick={() => setShowJson(true)}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
        >
          View JSON
        </button>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm hover:bg-gray-200 transition-colors p-2 rounded">
          {/* Left Column */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-0.5">Model</h4>
            <p className="text-gray-900">{definition?.model || '—'}</p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-0.5">Created</h4>
            <p className="text-gray-900">{formatDate(latestVersion?.created_at * 1000)}</p>
            {latestVersion?.metadata?.modified_at && (
              <>
                <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-0.5 mt-2">Modified</h4>
                <p className="text-gray-900">{formatDate(parseInt(latestVersion.metadata.modified_at) * 1000)}</p>
              </>
            )}
          </div>
        </div>

        {/* Instructions - Full Width */}
        {definition?.instructions && (
          <div className="mt-3 pt-3 border-t border-gray-100 hover:bg-gray-200 transition-colors">
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Instructions</h4>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{definition.instructions}</p>
          </div>
        )}

        {/* Description - Full Width */}
        {latestVersion?.description && (
          <div className="mt-3 pt-3 border-t border-gray-100 hover:bg-gray-200 transition-colors">
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Description</h4>
            <p className="text-sm text-gray-900">{latestVersion.description}</p>
          </div>
        )}

        {/* Metadata Section */}
        {Object.keys(metadata).length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 hover:bg-gray-200 transition-colors">
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-1.5">Metadata</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {Object.entries(metadata).map(([key, value]) => (
                <div key={key}>
                  <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-0.5">{key}</h4>
                  <p className="text-gray-900">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tools - Full Width */}
        <div className="mt-3 pt-3 border-t border-gray-100 hover:bg-gray-200 transition-colors">
          <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-1.5  ">Tools ({tools.length})</h4>
          {tools.length === 0 ? (
            <p className="text-sm text-gray-500">No tools configured</p>
          ) : (
            <div className="space-y-2">
              {tools.map((tool, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 bg-gray-50 p-2 rounded text-sm hover:bg-gray-200 transition-colors">
                  <div className="font-medium text-gray-900">{tool.type}</div>
                  <pre className="text-xs overflow-auto bg-white p-2 rounded border border-gray-200">
                    {JSON.stringify(tool, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
