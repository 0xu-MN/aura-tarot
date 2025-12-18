import { useState } from 'react';
import { X, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (post: { title: string; content: string; type: string; images: File[] }) => void;
}

const POST_TYPES = [
    { value: 'general', label: '일상' },
    { value: 'tarot', label: '타로공유' },
    { value: 'question', label: '질문' },
    { value: 'ad', label: '광고' },
];

export const CreatePostModal = ({ isOpen, onClose, onSubmit }: CreatePostModalProps) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState('general');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (images.length + files.length > 5) {
            toast.error('이미지는 최대 5개까지 업로드할 수 있습니다.');
            return;
        }

        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...files]);
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        URL.revokeObjectURL(imagePreviews[index]);
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            toast.error('제목과 내용을 입력해주세요.');
            return;
        }

        setLoading(true);

        try {
            if (onSubmit) {
                await onSubmit({
                    title,
                    content,
                    type: postType,
                    images,
                });
            }

            toast.success('게시글이 작성되었습니다!');
            handleClose();
        } catch (error) {
            toast.error('게시글 작성에 실패했습니다.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Clean up preview URLs
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        setTitle('');
        setContent('');
        setPostType('general');
        setImages([]);
        setImagePreviews([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/90 backdrop-blur-md"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-3xl border border-gold/30 shadow-2xl animate-scale-in">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 md:p-8">
                    <h2 className="font-display text-3xl text-gold-gradient mb-6 text-center">
                        게시글 작성
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Post Type */}
                        <div className="space-y-2">
                            <Label htmlFor="postType">카테고리</Label>
                            <Select value={postType} onValueChange={setPostType}>
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="카테고리 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {POST_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">제목</Label>
                            <Input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="제목을 입력하세요"
                                required
                                className="bg-background/50"
                                maxLength={100}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {title.length}/100
                            </p>
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <Label htmlFor="content">내용</Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="내용을 입력하세요"
                                required
                                className="min-h-[200px] bg-background/50 resize-none"
                                maxLength={2000}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {content.length}/2000
                            </p>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>이미지 (선택, 최대 5개)</Label>

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    {imagePreviews.map((preview, index) => (
                                        <div
                                            key={index}
                                            className="relative aspect-square rounded-lg overflow-hidden border border-gold/20"
                                        >
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload Button */}
                            {images.length < 5 && (
                                <label
                                    htmlFor="imageUpload"
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gold/30 hover:border-gold/50 cursor-pointer transition-colors",
                                        "bg-background/50 hover:bg-background/80"
                                    )}
                                >
                                    <ImageIcon className="w-5 h-5 text-gold" />
                                    <span className="text-sm">
                                        {images.length === 0 ? '이미지 추가' : `이미지 추가 (${images.length}/5)`}
                                    </span>
                                    <input
                                        id="imageUpload"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1"
                            >
                                취소
                            </Button>
                            <Button
                                type="submit"
                                variant="gold"
                                className="flex-1"
                                disabled={loading}
                            >
                                {loading ? '작성 중...' : '작성 완료'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
