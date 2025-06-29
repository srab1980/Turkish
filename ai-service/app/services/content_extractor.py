import PyPDF2
from docx import Document
import ebooklib
from ebooklib import epub
from typing import Dict, Any, List
import re
import os
from app.models.content import ContentType, CEFRLevel
from app.core.config import settings

class ContentExtractor:
    """Service for extracting text and metadata from various file formats"""
    
    def __init__(self):
        self.supported_formats = {
            ContentType.PDF: self._extract_pdf,
            ContentType.DOCX: self._extract_docx,
            ContentType.EPUB: self._extract_epub,
            ContentType.TXT: self._extract_txt
        }
    
    async def extract_content(self, file_path: str, content_type: ContentType) -> Dict[str, Any]:
        """Extract content from file based on type"""
        if content_type not in self.supported_formats:
            raise ValueError(f"Unsupported content type: {content_type}")
        
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        extractor = self.supported_formats[content_type]
        return await extractor(file_path)
    
    async def _extract_pdf(self, file_path: str) -> Dict[str, Any]:
        """Extract content from PDF file"""
        try:
            text = ""
            metadata = {}

            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                metadata["page_count"] = len(pdf_reader.pages)

                # Extract text from all pages
                for page_num, page in enumerate(pdf_reader.pages):
                    try:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
                    except Exception as e:
                        print(f"Error extracting text from page {page_num}: {e}")
                        continue

                # Extract metadata
                if pdf_reader.metadata:
                    metadata.update({
                        "title": pdf_reader.metadata.get("/Title", ""),
                        "author": pdf_reader.metadata.get("/Author", ""),
                        "subject": pdf_reader.metadata.get("/Subject", ""),
                        "creator": pdf_reader.metadata.get("/Creator", "")
                    })

            # Clean and process text
            cleaned_text = self._clean_text(text)

            return {
                "text": cleaned_text,
                "metadata": metadata,
                "word_count": len(cleaned_text.split()),
                "character_count": len(cleaned_text)
            }

        except Exception as e:
            return {
                "text": f"Error extracting PDF: {str(e)}",
                "metadata": {"error": str(e)},
                "word_count": 0,
                "character_count": 0
            }
    
    async def _extract_docx(self, file_path: str) -> Dict[str, Any]:
        """Extract content from DOCX file"""
        try:
            doc = Document(file_path)
            text = ""
            metadata = {}

            # Extract text from paragraphs
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text += paragraph.text + "\n"

            # Extract metadata
            core_props = doc.core_properties
            metadata.update({
                "title": core_props.title or "",
                "author": core_props.author or "",
                "subject": core_props.subject or "",
                "created": str(core_props.created) if core_props.created else "",
                "modified": str(core_props.modified) if core_props.modified else ""
            })

            # Clean and process text
            cleaned_text = self._clean_text(text)

            return {
                "text": cleaned_text,
                "metadata": metadata,
                "word_count": len(cleaned_text.split()),
                "character_count": len(cleaned_text)
            }

        except Exception as e:
            return {
                "text": f"Error extracting DOCX: {str(e)}",
                "metadata": {"error": str(e)},
                "word_count": 0,
                "character_count": 0
            }
    
    async def _extract_epub(self, file_path: str) -> Dict[str, Any]:
        """Extract content from EPUB file"""
        try:
            book = epub.read_epub(file_path)
            text = ""
            metadata = {}

            # Extract metadata
            metadata.update({
                "title": book.get_metadata('DC', 'title')[0][0] if book.get_metadata('DC', 'title') else "",
                "author": book.get_metadata('DC', 'creator')[0][0] if book.get_metadata('DC', 'creator') else "",
                "language": book.get_metadata('DC', 'language')[0][0] if book.get_metadata('DC', 'language') else "",
                "publisher": book.get_metadata('DC', 'publisher')[0][0] if book.get_metadata('DC', 'publisher') else ""
            })

            # Extract text from all items
            for item in book.get_items():
                if item.get_type() == ebooklib.ITEM_DOCUMENT:
                    try:
                        content = item.get_content().decode('utf-8')
                        # Simple HTML tag removal
                        import re
                        clean_content = re.sub(r'<[^>]+>', '', content)
                        clean_content = re.sub(r'\s+', ' ', clean_content)
                        text += clean_content + "\n"
                    except Exception as e:
                        print(f"Error extracting content from item {item.get_name()}: {e}")
                        continue

            # Clean and process text
            cleaned_text = self._clean_text(text)

            return {
                "text": cleaned_text,
                "metadata": metadata,
                "word_count": len(cleaned_text.split()),
                "character_count": len(cleaned_text)
            }

        except Exception as e:
            return {
                "text": f"Error extracting EPUB: {str(e)}",
                "metadata": {"error": str(e)},
                "word_count": 0,
                "character_count": 0
            }
    
    async def _extract_txt(self, file_path: str) -> Dict[str, Any]:
        """Extract content from TXT file"""
        with open(file_path, 'r', encoding='utf-8') as file:
            text_content = file.read()
        
        metadata = {
            "file_size": os.path.getsize(file_path),
            "encoding": "utf-8"
        }
        
        return {
            "text": self._clean_text(text_content),
            "metadata": metadata,
            "word_count": len(text_content.split()),
            "character_count": len(text_content)
        }
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize extracted text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep Turkish characters
        text = re.sub(r'[^\w\s\.,!?;:()"\'-çğıöşüÇĞIİÖŞÜ]', '', text)
        # Strip leading/trailing whitespace
        text = text.strip()
        return text
