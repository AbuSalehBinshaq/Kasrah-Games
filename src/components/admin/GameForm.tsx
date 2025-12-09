'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { gameSchema, type GameInput } from '@/lib/validation';

// Extended schema for form (includes isPublished and isFeatured)
const gameFormSchema = gameSchema.extend({
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
}).refine((data) => {
  // Ensure technologies is always an array
  return Array.isArray(data.technologies);
}, {
  message: "Technologies must be an array",
  path: ["technologies"],
});

type GameFormInput = z.infer<typeof gameFormSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

type PartialGameData = Partial<GameFormInput> & {
  categoryIds?: string[];
  technologies?: string[];
  tags?: string[];
};

interface GameFormProps {
  gameId?: string;
  initialData?: PartialGameData;
}

export default function GameForm({ gameId, initialData }: GameFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [technologies, setTechnologies] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>(['']);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<GameFormInput>({
    resolver: zodResolver(gameFormSchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      developer: '',
      publisher: '',
      gameUrl: '',
      thumbnail: '',
      coverImage: '',
      gameType: 'HTML5',
      technologies: [],
      tags: [],
      ageRating: '',
      categoryIds: [],
      isPublished: true,
      isFeatured: false,
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Hydrate form when editing
  useEffect(() => {
    if (!initialData) return;

    const keys = Object.keys(initialData) as (keyof GameFormInput)[];
    keys.forEach((key) => {
      const value = (initialData as any)[key];
      if (value !== undefined) {
        setValue(key, value as any);
      }
    });

    const techs = initialData.technologies && initialData.technologies.length > 0
      ? initialData.technologies
      : [''];
    setTechnologies(techs);
    setValue('technologies', techs.filter(t => t.trim() !== ''));

    const tagList = initialData.tags && initialData.tags.length > 0
      ? initialData.tags
      : [''];
    setTags(tagList);
    setValue('tags', tagList.filter(t => t.trim() !== ''));

    setValue('categoryIds', initialData.categoryIds || []);
  }, [initialData, setValue]);

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories?limit=100');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }

  const selectedCategoryIds = watch('categoryIds') || [];

  function addTechnologyField() {
    setTechnologies([...technologies, '']);
  }

  function removeTechnologyField(index: number) {
    setTechnologies(technologies.filter((_, i) => i !== index));
  }

  function updateTechnology(index: number, value: string) {
    const updated = [...technologies];
    updated[index] = value;
    setTechnologies(updated);
    setValue('technologies', updated.filter(t => t.trim() !== ''));
  }

  function addTagField() {
    setTags([...tags, '']);
  }

  function removeTagField(index: number) {
    setTags(tags.filter((_, i) => i !== index));
  }

  function updateTag(index: number, value: string) {
    const updated = [...tags];
    updated[index] = value;
    setTags(updated);
    setValue('tags', updated.filter(t => t.trim() !== ''));
  }

  function toggleCategory(categoryId: string) {
    const current = selectedCategoryIds;
    const updated = current.includes(categoryId)
      ? current.filter(id => id !== categoryId)
      : [...current, categoryId];
    setValue('categoryIds', updated);
  }

  async function onSubmit(data: GameFormInput) {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      // Normalize slug: convert to lowercase and trim
      const normalizedSlug = data.slug.toLowerCase().trim();
      console.log('📝 Submitting game with slug:', normalizedSlug, '(original:', data.slug, ')');
      
      // Ensure technologies is an array
      const submitData = {
        ...data,
        slug: normalizedSlug, // Use normalized slug
        technologies: Array.isArray(data.technologies) ? data.technologies : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        categoryIds: Array.isArray(data.categoryIds) ? data.categoryIds : [],
      };

      const isEdit = Boolean(gameId);
      const response = await fetch(isEdit ? `/api/admin/games/${gameId}` : '/api/admin/games', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert(isEdit ? 'Game updated successfully!' : 'Game added successfully!');
        router.push('/admin/games');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setErrorMessage(`Failed to ${isEdit ? 'update' : 'add'} game: ${errorData.message || errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrorMessage('An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register('title')} />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL Path)</Label>
          <Input id="slug" {...register('slug')} placeholder="my-game-slug" />
          <p className="text-xs text-gray-500">
            Only lowercase letters, numbers, and hyphens. Example: my-game-slug
          </p>
          {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDescription">Short Description</Label>
        <Textarea id="shortDescription" {...register('shortDescription')} />
        {errors.shortDescription && <p className="text-sm text-red-500">{errors.shortDescription.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Full Description</Label>
        <Textarea id="description" rows={5} {...register('description')} />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="developer">Developer</Label>
          <Input id="developer" {...register('developer')} />
          {errors.developer && <p className="text-sm text-red-500">{errors.developer.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="gameUrl">Game URL (iframe source)</Label>
          <Input id="gameUrl" {...register('gameUrl')} />
          {errors.gameUrl && <p className="text-sm text-red-500">{errors.gameUrl.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="thumbnail">Thumbnail URL</Label>
          <Input id="thumbnail" {...register('thumbnail')} />
          {errors.thumbnail && <p className="text-sm text-red-500">{errors.thumbnail.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="coverImage">Cover Image URL (Optional)</Label>
          <Input id="coverImage" {...register('coverImage')} />
          {errors.coverImage && <p className="text-sm text-red-500">{errors.coverImage.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="publisher">Publisher (Optional)</Label>
          <Input id="publisher" {...register('publisher')} />
          {errors.publisher && <p className="text-sm text-red-500">{errors.publisher.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="gameType">Game Type</Label>
          <Controller
            name="gameType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Game Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HTML5">HTML5</SelectItem>
                  <SelectItem value="WebGL">WebGL</SelectItem>
                  <SelectItem value="Unity">Unity</SelectItem>
                  <SelectItem value="Flash">Flash</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.gameType && <p className="text-sm text-red-500">{errors.gameType.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Categories *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border border-gray-300 rounded-lg bg-white">
          {categories.map(category => (
            <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategoryIds.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-200"
              />
              <span className="text-sm text-gray-900">{category.name}</span>
            </label>
          ))}
        </div>
        {errors.categoryIds && (
          <p className="text-sm text-red-500">{errors.categoryIds.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Technologies</Label>
        {technologies.map((tech, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={tech}
              onChange={(e) => updateTechnology(index, e.target.value)}
              placeholder="e.g., JavaScript, Phaser, Three.js"
            />
            {technologies.length > 1 && (
              <Button
                type="button"
                onClick={() => removeTechnologyField(index)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          onClick={addTechnologyField}
          className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Add Technology
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        {tags.map((tag, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={tag}
              onChange={(e) => updateTag(index, e.target.value)}
              placeholder="e.g., multiplayer, casual, physics"
            />
            {tags.length > 1 && (
              <Button
                type="button"
                onClick={() => removeTagField(index)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          onClick={addTagField}
          className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Add Tag
        </Button>
        <p className="text-xs text-gray-500">Use tags for search and discovery (e.g., multiplayer, casual, coop).</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ageRating">Age Rating (Optional)</Label>
        <Input id="ageRating" {...register('ageRating')} placeholder="e.g., E, E10+, T, M" />
        {errors.ageRating && <p className="text-sm text-red-500">{errors.ageRating.message}</p>}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Controller
            name="isPublished"
            control={control}
            render={({ field }) => (
              <Switch
                id="isPublished"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="isPublished">Published</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Controller
            name="isFeatured"
            control={control}
            render={({ field }) => (
              <Switch
                id="isFeatured"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="isFeatured">Featured</Label>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} variant="default">
        {isSubmitting ? 'Adding Game...' : 'Add Game'}
      </Button>
      {errorMessage && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}
    </form>
  );
}
