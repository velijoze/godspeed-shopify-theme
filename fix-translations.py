#!/usr/bin/env python3
"""
Fix translation keys in Shopify theme sections
Replace t:sections.*.* keys with actual English text
"""

import os
import re
import glob

# Translation mappings
translations = {
    # Section names
    't:sections.contact-form.name': 'Contact form',
    't:sections.contact-form.presets.name': 'Contact form',
    't:sections.image-banner.name': 'Image banner',
    't:sections.multicolumn.name': 'Multicolumn',
    't:sections.rich-text.name': 'Rich text',
    't:sections.footer.name': 'Footer',
    't:sections.header.name': 'Header',
    't:sections.slideshow.name': 'Slideshow',
    't:sections.newsletter.name': 'Newsletter',
    't:sections.featured-product.name': 'Featured product',
    't:sections.featured-collection.name': 'Featured collection',
    't:sections.collection-list.name': 'Collection list',
    't:sections.video.name': 'Video',
    't:sections.multirow.name': 'Multirow',
    't:sections.collapsible-content.name': 'Collapsible content',
    't:sections.product-recommendations.name': 'Product recommendations',
    
    # Common labels
    't:sections.all.heading_size.label': 'Heading size',
    't:sections.all.colors.label': 'Color scheme',
    't:sections.all.padding.section_padding_heading': 'Section padding',
    't:sections.all.padding.padding_top': 'Top padding',
    't:sections.all.padding.padding_bottom': 'Bottom padding',
    
    # Heading size options
    't:sections.all.heading_size.options__1.label': 'Small',
    't:sections.all.heading_size.options__2.label': 'Medium', 
    't:sections.all.heading_size.options__3.label': 'Large',
    't:sections.all.heading_size.options__4.label': 'Extra Large',
    't:sections.all.heading_size.options__5.label': 'Extra Extra Large',
    
    # Contact form specific
    't:sections.contact-form.settings.title.default': 'Contact us',
    't:sections.contact-form.settings.title.label': 'Heading',
    
    # Image banner
    't:sections.image-banner.settings.image.label': 'Image',
    't:sections.image-banner.settings.heading.label': 'Heading',
    't:sections.image-banner.settings.text.label': 'Text',
    't:sections.image-banner.settings.button_label.label': 'Button label',
    't:sections.image-banner.settings.button_link.label': 'Button link',
}

def fix_section_file(filepath):
    """Fix translation keys in a single section file"""
    print(f"Processing: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Replace all translation keys
    for key, value in translations.items():
        # Replace both quoted versions
        content = content.replace(f'"{key}"', f'"{value}"')
        content = content.replace(f"'{key}'", f"'{value}'")
    
    # Check if file was modified
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ Fixed translation keys in {os.path.basename(filepath)}")
        return True
    else:
        print(f"  ✓ No changes needed in {os.path.basename(filepath)}")
        return False

def main():
    """Process all section files"""
    sections_dir = './sections'
    
    if not os.path.exists(sections_dir):
        print(f"❌ Sections directory not found: {sections_dir}")
        return
    
    # Find all .liquid files in sections directory
    section_files = glob.glob(os.path.join(sections_dir, '*.liquid'))
    
    if not section_files:
        print(f"❌ No .liquid files found in {sections_dir}")
        return
    
    print(f"🔧 Found {len(section_files)} section files to process...")
    print()
    
    fixed_count = 0
    
    for filepath in sorted(section_files):
        if fix_section_file(filepath):
            fixed_count += 1
    
    print()
    print(f"🎉 Complete! Fixed translation keys in {fixed_count}/{len(section_files)} files")

if __name__ == '__main__':
    main()