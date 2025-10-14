'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface EditableSection {
  heading: string
  fullText: string
  originalData: any
}

interface PrivacyPolicy {
  id: string
  content: {
    title: string
    sections: any[]
  }
  last_updated: string
}

export default function PrivacyPolicyEditor() {
  const [policy, setPolicy] = useState<PrivacyPolicy | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sections, setSections] = useState<EditableSection[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchPolicy()
  }, [])

  function extractFullText(section: any): string {
    let text = ''
    
    if (section.content) {
      text += section.content + '\n\n'
    }
    
    if (section.items) {
      text += section.items.join('\n') + '\n\n'
    }
    
    if (section.subsections) {
      section.subsections.forEach((sub: any) => {
        text += `${sub.heading}:\n`
        if (sub.content) text += sub.content + '\n'
        if (sub.items) text += sub.items.join('\n') + '\n'
        text += '\n'
      })
    }
    
    if (section.note) {
      text += 'Note: ' + section.note
    }
    
    return text.trim()
  }

  async function fetchPolicy() {
    try {
      // Fetch directly from Supabase
      const { data, error } = await supabase
        .from('privacy_policy')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      setPolicy(data)
      
      const editableSections = data.content.sections.map((s: any) => ({
        heading: s.heading,
        fullText: extractFullText(s),
        originalData: s
      }))
      
      setSections(editableSections)
    } catch (err) {
      console.error('Error fetching policy:', err)
      setError('Failed to load privacy policy')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const updatedSections = sections.map(s => ({
        heading: s.heading,
        content: s.fullText
      }))
      
      const content = {
        title: "Privacy Policy",
        sections: updatedSections
      }
      
      // Update directly in Supabase
      const { data: policyData, error: policyError } = await supabase
        .from('privacy_policy')
        .select('id')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single()

      if (policyError) throw policyError

      const { data: updatedData, error: updateError } = await supabase
        .from('privacy_policy')
        .update({
          content,
          last_updated: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', policyData.id)
        .select()
        .single()

      if (updateError) throw updateError
      setPolicy(updatedData)
      setSuccess('✅ Privacy policy updated successfully! Changes are now live.')
      
      setTimeout(() => {
        setSuccess(null)
        fetchPolicy()
      }, 2000)
    } catch (err) {
      console.error('Error saving policy:', err)
      setError(err instanceof Error ? err.message : 'Failed to save policy')
    } finally {
      setSaving(false)
    }
  }

  function updateSection(index: number, field: 'heading' | 'fullText', value: string) {
    const newSections = [...sections]
    newSections[index] = { ...newSections[index], [field]: value }
    setSections(newSections)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Privacy Policy Editor</h2>
          <p className="text-gray-600 mt-1">
            Edit privacy policy - changes appear instantly on landing page
          </p>
          {policy && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {formatDate(policy.last_updated)}
            </p>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <p className="text-sm text-yellow-700">
          <strong>Important:</strong> Changes are saved to database and visible immediately!
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
        {sections.map((section, index) => (
          <div key={index} className="border-b border-gray-200 pb-8 last:border-0">
            <div className="space-y-4">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  {index + 1}. Title
                </label>
                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) => updateSection(index, 'heading', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  {index + 1}. Content
                </label>
                <textarea
                  value={section.fullText}
                  onChange={(e) => updateSection(index, 'fullText', e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y font-mono text-sm text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-3 pt-6 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-lg"
          >
            {saving ? '💾 Saving...' : '💾 Save All Changes'}
          </button>
          <button
            onClick={fetchPolicy}
            disabled={saving}
            className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  )
}
