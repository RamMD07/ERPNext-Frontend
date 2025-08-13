import React, { useState, useEffect } from 'react';
import { DocField, FieldType } from '../../types/frappe';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { 
  Calendar,
  Clock,
  Link as LinkIcon,
  Upload,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import frappeAPI from '../../lib/api';

interface FieldRendererProps {
  field: DocField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  doctype: string;
  allValues: Record<string, any>;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  doctype,
  allValues,
}) => {
  const [linkOptions, setLinkOptions] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load link options
  useEffect(() => {
    if (field.fieldtype === 'Link' && field.options) {
      loadLinkOptions(field.options);
    }
  }, [field.fieldtype, field.options]);

  const loadLinkOptions = async (linkDoctype: string) => {
    try {
      setLoading(true);
      const options = await frappeAPI.getList(linkDoctype, {
        fields: ['name', 'title', field.options === 'User' ? 'full_name' : ''],
        limit_page_length: 50
      });
      setLinkOptions(options);
    } catch (error) {
      console.error('Failed to load link options:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const result = await frappeAPI.uploadFile(file, doctype);
      onChange(result.file_url);
    } catch (error) {
      console.error('File upload failed:', error);
    }
  };

  // Render different field types
  const renderField = () => {
    switch (field.fieldtype as FieldType) {
      case 'Data':
      case 'Small Text':
        return (
          <Input
            label={field.label}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description}
            disabled={disabled}
            error={error}
            required={field.reqd}
            maxLength={field.length}
          />
        );

      case 'Text':
      case 'Long Text':
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
              {field.reqd && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.description}
              disabled={disabled}
              rows={field.fieldtype === 'Long Text' ? 6 : 3}
              className={clsx(
                'block w-full rounded-lg border-gray-300 shadow-sm transition-colors duration-200',
                'focus:border-blue-500 focus:ring-blue-500 focus:ring-1',
                'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100',
                'dark:focus:border-blue-400 dark:focus:ring-blue-400',
                error && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        );

      case 'Int':
        return (
          <Input
            type="number"
            label={field.label}
            value={value || ''}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            placeholder={field.description}
            disabled={disabled}
            error={error}
            required={field.reqd}
            step="1"
          />
        );

      case 'Float':
      case 'Currency':
      case 'Percent':
        return (
          <Input
            type="number"
            label={field.label}
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            placeholder={field.description}
            disabled={disabled}
            error={error}
            required={field.reqd}
            step="0.01"
            startIcon={field.fieldtype === 'Currency' ? '$' : field.fieldtype === 'Percent' ? '%' : undefined}
          />
        );

      case 'Date':
        return (
          <Input
            type="date"
            label={field.label}
            value={value ? value.split(' ')[0] : ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            error={error}
            required={field.reqd}
            startIcon={<Calendar className="h-4 w-4" />}
          />
        );

      case 'Datetime':
        return (
          <Input
            type="datetime-local"
            label={field.label}
            value={value ? value.replace(' ', 'T').slice(0, 16) : ''}
            onChange={(e) => onChange(e.target.value.replace('T', ' ') + ':00')}
            disabled={disabled}
            error={error}
            required={field.reqd}
            startIcon={<Clock className="h-4 w-4" />}
          />
        );

      case 'Time':
        return (
          <Input
            type="time"
            label={field.label}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            error={error}
            required={field.reqd}
            startIcon={<Clock className="h-4 w-4" />}
          />
        );

      case 'Check':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.fieldname}
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label 
              htmlFor={field.fieldname} 
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {field.label}
              {field.reqd && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        );

      case 'Select':
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
              {field.reqd && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={clsx(
                'block w-full rounded-lg border-gray-300 shadow-sm transition-colors duration-200',
                'focus:border-blue-500 focus:ring-blue-500 focus:ring-1',
                'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100',
                error && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
            >
              <option value="">Select {field.label}</option>
              {field.options?.split('\n').map((option, index) => (
                <option key={index} value={option.trim()}>
                  {option.trim()}
                </option>
              ))}
            </select>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        );

      case 'Link':
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
              {field.reqd && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled || loading}
                className={clsx(
                  'block w-full rounded-lg border-gray-300 shadow-sm transition-colors duration-200',
                  'focus:border-blue-500 focus:ring-blue-500 focus:ring-1',
                  'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100',
                  error && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                )}
              >
                <option value="">Select {field.options}</option>
                {linkOptions.map((option) => (
                  <option key={option.name} value={option.name}>
                    {option.title || option.full_name || option.name}
                  </option>
                ))}
              </select>
              <LinkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        );

      case 'Password':
        return (
          <Input
            type={showPassword ? 'text' : 'password'}
            label={field.label}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description}
            disabled={disabled}
            error={error}
            required={field.reqd}
            endIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        );

      case 'Attach':
      case 'Attach Image':
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
              {field.reqd && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept={field.fieldtype === 'Attach Image' ? 'image/*' : '*/*'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
                disabled={disabled}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {value && (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Upload className="h-4 w-4" />
                </a>
              )}
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        );

      case 'Color':
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
              {field.reqd && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="h-10 w-16 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        );

      case 'Rating':
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
              {field.reqd && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onChange(star)}
                  disabled={disabled}
                  className={clsx(
                    'text-2xl transition-colors',
                    value >= star ? 'text-yellow-400' : 'text-gray-300',
                    !disabled && 'hover:text-yellow-300'
                  )}
                >
                  ⭐
                </button>
              ))}
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        );

      case 'Read Only':
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
              {value || '-'}
            </div>
          </div>
        );

      case 'HTML':
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
            <div 
              className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              dangerouslySetInnerHTML={{ __html: field.options || '' }}
            />
          </div>
        );

      case 'Heading':
        return (
          <div className="py-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {field.label}
            </h3>
          </div>
        );

      default:
        return (
          <Input
            label={field.label}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description}
            disabled={disabled}
            error={error}
            required={field.reqd}
          />
        );
    }
  };

  // Don't render hidden fields
  if (field.hidden) {
    return null;
  }

  // Handle depends_on conditions
  if (field.depends_on) {
    // Simple evaluation of depends_on conditions
    // This would need to be more sophisticated in a real implementation
    const dependsOnField = field.depends_on.replace(/^eval:/, '');
    if (!allValues[dependsOnField]) {
      return null;
    }
  }

  return (
    <div className="space-y-1">
      {renderField()}
      {field.description && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {field.description}
        </p>
      )}
    </div>
  );
};

export default FieldRenderer;