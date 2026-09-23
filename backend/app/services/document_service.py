import os
import re
import logging
from typing import Dict, List, Any, Optional
import pymupdf  # PyMuPDF

logger = logging.getLogger(__name__)

COMMON_SECTIONS = [
    "abstract",
    "introduction",
    "background",
    "related work",
    "methodology",
    "methods",
    "approach",
    "architecture",
    "system design",
    "experiments",
    "experimental setup",
    "evaluation",
    "results",
    "discussion",
    "limitations",
    "future work",
    "conclusion",
    "conclusions",
    "references",
    "acknowledgments",
]


class DocumentService:
    """
    High-fidelity PDF document parser using PyMuPDF.
    Extracts text, pages, section headers via font-size heuristics and regex,
    and document metadata.
    """

    @staticmethod
    def extract_document(file_path: str) -> Dict[str, Any]:
        """
        Extracts structured content from a PDF file.
        Returns:
            {
                "page_count": int,
                "metadata": dict,
                "title": Optional[str],
                "abstract": Optional[str],
                "pages": List[Dict[str, Any]] (page_num, text, detected_section)
            }
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        try:
            doc = pymupdf.open(file_path)
        except Exception as e:
            logger.error(f"Failed to open PDF {file_path}: {e}")
            raise ValueError(f"Invalid or corrupted PDF file: {e}")

        if doc.page_count == 0:
            doc.close()
            raise ValueError("PDF contains 0 pages or is empty.")

        meta = doc.metadata or {}
        extracted_pages = []
        full_text = []
        extracted_tables = []
        extracted_figures = []

        current_section = "Introduction"
        detected_title = meta.get("title") or None
        detected_abstract = None

        figures_dir = os.path.join(os.path.dirname(file_path), "figures")
        os.makedirs(figures_dir, exist_ok=True)

        for page_idx in range(doc.page_count):
            page = doc.load_page(page_idx)
            page_num = page_idx + 1

            # Extract detailed text blocks with font sizes
            page_dict = page.get_text("dict")
            raw_text = page.get_text("text")

            # Extract Tables via PyMuPDF table finder
            try:
                tabs = page.find_tables()
                for t_idx, tab in enumerate(tabs):
                    table_data = tab.extract()
                    if table_data and len(table_data) > 1:
                        headers = [str(h or "") for h in table_data[0]]
                        rows = [[str(cell or "") for cell in r] for r in table_data[1:]]
                        extracted_tables.append({
                            "page_number": page_num,
                            "table_index": len(extracted_tables) + 1,
                            "title": f"Table on Page {page_num}",
                            "headers": headers,
                            "rows": rows[:10],  # cap display rows
                        })
            except Exception as tab_err:
                logger.debug(f"Table extraction on page {page_num}: {tab_err}")

            # Extract Images / Figures
            try:
                image_list = page.get_images(full=True)
                for img_idx, img in enumerate(image_list):
                    xref = img[0]
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]
                    fig_filename = f"fig_p{page_num}_{img_idx}.{image_ext}"
                    fig_path = os.path.join(figures_dir, fig_filename)
                    if not os.path.exists(fig_path):
                        with open(fig_path, "wb") as f_img:
                            f_img.write(image_bytes)

                    # Only record non-tiny images (ignore 1x1 bullet icons)
                    if base_image.get("width", 0) > 80 and base_image.get("height", 0) > 80:
                        extracted_figures.append({
                            "page_number": page_num,
                            "figure_index": len(extracted_figures) + 1,
                            "filename": fig_filename,
                            "width": base_image.get("width"),
                            "height": base_image.get("height"),
                            "title": f"Figure on Page {page_num}",
                        })
            except Exception as img_err:
                logger.debug(f"Image extraction on page {page_num}: {img_err}")

            # Detect title from first page if not found in metadata
            if page_num == 1 and not detected_title:
                largest_span = ""
                largest_size = 0.0
                for block in page_dict.get("blocks", []):
                    if "lines" in block:
                        for line in block["lines"]:
                            for span in line.get("spans", []):
                                text = span.get("text", "").strip()
                                size = span.get("size", 0.0)
                                if size > largest_size and len(text) > 5 and not text.lower().startswith("arxiv"):
                                    largest_size = size
                                    largest_span = text
                if largest_span:
                    detected_title = largest_span

            # Page section detection
            page_lines = raw_text.splitlines()
            for line in page_lines:
                clean_line = line.strip()
                if not clean_line:
                    continue
                normalized = re.sub(r"^[0-9IVXLCDM\.\s]+", "", clean_line).strip().lower()
                if normalized in COMMON_SECTIONS and len(clean_line) < 50:
                    current_section = clean_line.title()

                if "abstract" in normalized and not detected_abstract and page_num <= 2:
                    abstract_match = re.search(r"abstract[\s\.\:\-]*(.+)", raw_text, re.IGNORECASE | re.DOTALL)
                    if abstract_match:
                        detected_abstract = abstract_match.group(1)[:1500].strip()

            extracted_pages.append({
                "page_number": page_num,
                "text": raw_text.strip(),
                "section": current_section,
            })
            full_text.append(raw_text)

        doc.close()

        # Fallback abstract extraction from first page text
        if not detected_abstract and extracted_pages:
            first_page_text = extracted_pages[0]["text"]
            abs_match = re.search(r"(?:abstract|summary)[\:\.\s]*(.+?)(?:\n\s*\n|1\.\s+introduction|introduction)", first_page_text, re.IGNORECASE | re.DOTALL)
            if abs_match:
                detected_abstract = abs_match.group(1).strip()

        return {
            "page_count": len(extracted_pages),
            "metadata": meta,
            "title": detected_title or os.path.splitext(os.path.basename(file_path))[0],
            "abstract": detected_abstract,
            "pages": extracted_pages,
            "tables": extracted_tables,
            "figures": extracted_figures,
            "full_text": "\n\n".join(full_text),
        }
