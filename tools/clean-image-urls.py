#!/usr/bin/env python3
"""
Image URL Cleaner Script
Cleans image URLs by removing query parameters from exam data files
"""

import json
import re
import os
import glob
from urllib.parse import urlparse, urlunparse
from typing import Dict, List, Any, Optional

class ImageUrlCleaner:
    def __init__(self):
        self.cleaned_count = 0
        self.total_count = 0
        
    def clean_image_url(self, url: str) -> str:
        """
        Clean image URL by removing query parameters
        
        Args:
            url: The image URL with query parameters
            
        Returns:
            Clean URL without query parameters
        """
        if not url or not isinstance(url, str):
            return url
            
        try:
            # Parse the URL
            parsed = urlparse(url)
            
            # Reconstruct URL without query and fragment
            clean_url = urlunparse((
                parsed.scheme,
                parsed.netloc,
                parsed.path,
                parsed.params,
                '',  # Remove query
                ''   # Remove fragment
            ))
            
            return clean_url
            
        except Exception as e:
            print(f"Warning: Failed to parse URL '{url}': {e}")
            
            # Fallback: simple string manipulation
            if '?' in url:
                return url.split('?')[0]
            if '#' in url:
                return url.split('#')[0]
                
            return url
    
    def clean_html_images(self, html_content: str) -> str:
        """
        Clean image URLs in HTML content
        
        Args:
            html_content: HTML content containing image tags
            
        Returns:
            HTML content with cleaned image URLs
        """
        if not html_content or not isinstance(html_content, str):
            return html_content
            
        # Regular expression to match img src attributes
        img_src_pattern = r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>'
        
        def replace_src(match):
            full_match = match.group(0)
            src_url = match.group(1)
            clean_url = self.clean_image_url(src_url)
            return full_match.replace(src_url, clean_url)
        
        return re.sub(img_src_pattern, replace_src, html_content)
    
    def clean_exam_data(self, exam_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Clean image URLs in exam data object
        
        Args:
            exam_data: Exam data object
            
        Returns:
            Exam data with cleaned image URLs
        """
        if not exam_data or not isinstance(exam_data, dict):
            return exam_data
            
        cleaned_data = exam_data.copy()
        
        # Clean direct image field
        if 'image' in cleaned_data and cleaned_data['image']:
            original_url = cleaned_data['image']
            cleaned_data['image'] = self.clean_image_url(original_url)
            if original_url != cleaned_data['image']:
                self.cleaned_count += 1
                print(f"Cleaned image URL: {original_url} -> {cleaned_data['image']}")
        
        # Clean image URLs in data.question_text
        if 'data' in cleaned_data and isinstance(cleaned_data['data'], dict):
            data = cleaned_data['data']
            
            if 'question_text' in data and data['question_text']:
                original_text = data['question_text']
                data['question_text'] = self.clean_html_images(original_text)
                if original_text != data['question_text']:
                    self.cleaned_count += 1
                    print(f"Cleaned image URLs in question_text")
            
            # Clean image URLs in data.question
            if 'question' in data and data['question']:
                original_question = data['question']
                data['question'] = self.clean_html_images(original_question)
                if original_question != data['question']:
                    self.cleaned_count += 1
                    print(f"Cleaned image URLs in question")
            
            # Clean image URLs in options if they contain HTML
            if 'options' in data and isinstance(data['options'], list):
                for i, option in enumerate(data['options']):
                    if isinstance(option, str) and '<img' in option:
                        original_option = option
                        data['options'][i] = self.clean_html_images(option)
                        if original_option != data['options'][i]:
                            self.cleaned_count += 1
                            print(f"Cleaned image URLs in option {i}")
        
        return cleaned_data
    
    def clean_exam_data_array(self, exam_data_array: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Clean image URLs in an array of exam data
        
        Args:
            exam_data_array: Array of exam data objects
            
        Returns:
            Array of exam data with cleaned image URLs
        """
        if not isinstance(exam_data_array, list):
            return exam_data_array
            
        return [self.clean_exam_data(exam_data) for exam_data in exam_data_array]
    
    def process_file(self, file_path: str, output_path: Optional[str] = None) -> bool:
        """
        Process a single JSON file to clean image URLs
        
        Args:
            file_path: Path to the input JSON file
            output_path: Path to the output file (if None, overwrites input)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            print(f"Processing file: {file_path}")
            
            # Read the JSON file
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Clean the data
            if isinstance(data, list):
                cleaned_data = self.clean_exam_data_array(data)
                self.total_count += len(data)
            elif isinstance(data, dict):
                cleaned_data = self.clean_exam_data(data)
                self.total_count += 1
            else:
                print(f"Warning: Unsupported data type in {file_path}")
                return False
            
            # Determine output path
            if output_path is None:
                output_path = file_path
            
            # Write the cleaned data
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(cleaned_data, f, indent=2, ensure_ascii=False)
            
            print(f"Successfully processed {file_path}")
            return True
            
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            return False
    
    def process_directory(self, directory_path: str, pattern: str = "*.json", 
                         backup: bool = True) -> Dict[str, bool]:
        """
        Process all JSON files in a directory
        
        Args:
            directory_path: Path to the directory
            pattern: File pattern to match
            backup: Whether to create backup files
            
        Returns:
            Dictionary mapping file paths to success status
        """
        results = {}
        
        # Find all JSON files
        search_pattern = os.path.join(directory_path, "**", pattern)
        files = glob.glob(search_pattern, recursive=True)
        
        if not files:
            print(f"No files found matching pattern: {search_pattern}")
            return results
        
        print(f"Found {len(files)} files to process")
        
        for file_path in files:
            # Create backup if requested
            if backup:
                backup_path = file_path + '.backup'
                if not os.path.exists(backup_path):
                    import shutil
                    shutil.copy2(file_path, backup_path)
                    print(f"Created backup: {backup_path}")
            
            # Process the file
            success = self.process_file(file_path)
            results[file_path] = success
        
        return results
    
    def get_stats(self) -> Dict[str, int]:
        """
        Get cleaning statistics
        
        Returns:
            Dictionary with cleaning statistics
        """
        return {
            'total_items': self.total_count,
            'cleaned_urls': self.cleaned_count,
            'clean_percentage': (self.cleaned_count / max(self.total_count, 1)) * 100
        }

def main():
    """Main function to run the image URL cleaner"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Clean image URLs in exam data files')
    parser.add_argument('path', help='Path to file or directory to process')
    parser.add_argument('--output', '-o', help='Output path (for single file)')
    parser.add_argument('--pattern', '-p', default='*.json', help='File pattern (for directories)')
    parser.add_argument('--no-backup', action='store_true', help='Do not create backup files')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be cleaned without making changes')
    
    args = parser.parse_args()
    
    cleaner = ImageUrlCleaner()
    
    if os.path.isfile(args.path):
        # Process single file
        if args.dry_run:
            print("Dry run mode - no changes will be made")
            # TODO: Implement dry run for single file
        else:
            success = cleaner.process_file(args.path, args.output)
            if success:
                print("File processed successfully")
            else:
                print("Failed to process file")
                return 1
    
    elif os.path.isdir(args.path):
        # Process directory
        if args.dry_run:
            print("Dry run mode - no changes will be made")
            # TODO: Implement dry run for directory
        else:
            results = cleaner.process_directory(
                args.path, 
                args.pattern, 
                backup=not args.no_backup
            )
            
            successful = sum(1 for success in results.values() if success)
            total = len(results)
            
            print(f"\nProcessing complete:")
            print(f"Successfully processed: {successful}/{total} files")
    
    else:
        print(f"Error: Path '{args.path}' does not exist")
        return 1
    
    # Print statistics
    stats = cleaner.get_stats()
    print(f"\nCleaning Statistics:")
    print(f"Total items processed: {stats['total_items']}")
    print(f"URLs cleaned: {stats['cleaned_urls']}")
    print(f"Clean percentage: {stats['clean_percentage']:.2f}%")
    
    return 0

if __name__ == '__main__':
    exit(main())
