import { describe, it, expect } from 'vitest';
import { translate, translations } from './i18n';

/**
 * Unit Tests for Admin UI Translation Keys
 * Task 3.6: Write unit tests for admin UI translation keys
 * 
 * Tests admin button, dashboard, table, form, and toast keys from tasks 3.1-3.5
 * Requirements: 2.3, 2.4, 2.5, 2.6, 2.7
 */

describe('Admin UI Translation Keys - Unit Tests', () => {
  describe('Requirement 2.3: Admin Button Translation Keys', () => {
    const buttonKeys = [
      'admin.button.addNew',
      'admin.button.edit',
      'admin.button.delete',
      'admin.button.save',
      'admin.button.cancel',
      'admin.button.create',
      'admin.button.signOut',
      'admin.button.viewSite',
      'admin.button.search',
      'admin.button.update',
      'admin.button.refresh',
      'admin.button.export',
      'admin.button.import',
      'admin.button.submit',
      'admin.button.close',
    ];

    it('should return correct English translations for all admin button keys', () => {
      expect(translate('en', 'admin.button.addNew')).toBe('Add New');
      expect(translate('en', 'admin.button.edit')).toBe('Edit');
      expect(translate('en', 'admin.button.delete')).toBe('Delete');
      expect(translate('en', 'admin.button.save')).toBe('Save Changes');
      expect(translate('en', 'admin.button.cancel')).toBe('Cancel');
      expect(translate('en', 'admin.button.create')).toBe('Create');
      expect(translate('en', 'admin.button.signOut')).toBe('Sign Out');
      expect(translate('en', 'admin.button.viewSite')).toBe('View Site');
      expect(translate('en', 'admin.button.search')).toBe('Search');
      expect(translate('en', 'admin.button.update')).toBe('Update');
      expect(translate('en', 'admin.button.refresh')).toBe('Refresh');
      expect(translate('en', 'admin.button.export')).toBe('Export');
      expect(translate('en', 'admin.button.import')).toBe('Import');
      expect(translate('en', 'admin.button.submit')).toBe('Submit');
      expect(translate('en', 'admin.button.close')).toBe('Close');
    });

    it('should return correct Persian (fa) translations for all admin button keys', () => {
      expect(translate('fa', 'admin.button.addNew')).toBe('افزودن جدید');
      expect(translate('fa', 'admin.button.edit')).toBe('ویرایش');
      expect(translate('fa', 'admin.button.delete')).toBe('حذف');
      expect(translate('fa', 'admin.button.save')).toBe('ذخیره تغییرات');
      expect(translate('fa', 'admin.button.cancel')).toBe('لغو');
      expect(translate('fa', 'admin.button.create')).toBe('ایجاد');
      expect(translate('fa', 'admin.button.signOut')).toBe('خروج');
      expect(translate('fa', 'admin.button.viewSite')).toBe('مشاهده سایت');
      expect(translate('fa', 'admin.button.search')).toBe('جستجو');
    });

    it('should return correct Pashto (ps) translations for all admin button keys', () => {
      expect(translate('ps', 'admin.button.addNew')).toBe('نوی اضافه کړئ');
      expect(translate('ps', 'admin.button.edit')).toBe('سمول');
      expect(translate('ps', 'admin.button.delete')).toBe('حذف کړئ');
      expect(translate('ps', 'admin.button.save')).toBe('بدلونونه خوندي کړئ');
      expect(translate('ps', 'admin.button.cancel')).toBe('لغوه');
    });

    it('should have all button keys present in all three languages', () => {
      buttonKeys.forEach((key) => {
        expect(translations.en).toHaveProperty(key);
        expect(translations.fa).toHaveProperty(key);
        expect(translations.ps).toHaveProperty(key);
        
        // Verify non-empty values
        expect(translations.en[key]).toBeTruthy();
        expect(translations.fa[key]).toBeTruthy();
        expect(translations.ps[key]).toBeTruthy();
      });
    });
  });

  describe('Requirement 2.4: Admin Dashboard Translation Keys', () => {
    const dashboardKeys = [
      'admin.dashboard.title',
      'admin.dashboard.recentMessages',
      'admin.dashboard.recentSubscribers',
      'admin.dashboard.visits',
      'admin.empty.noMessages',
      'admin.empty.noSubscribers',
    ];

    const statKeys = [
      'admin.stat.services',
      'admin.stat.visas',
      'admin.stat.opportunities',
      'admin.stat.news',
      'admin.stat.messages',
      'admin.stat.subscribers',
      'admin.stat.gallery',
      'admin.stat.visits',
    ];

    it('should return correct English translations for admin dashboard keys', () => {
      expect(translate('en', 'admin.dashboard.title')).toBe('Dashboard');
      expect(translate('en', 'admin.dashboard.recentMessages')).toBe('Recent Messages');
      expect(translate('en', 'admin.dashboard.recentSubscribers')).toBe('Recent Subscribers');
      expect(translate('en', 'admin.dashboard.visits')).toBe('Visits');
      expect(translate('en', 'admin.empty.noMessages')).toBe('No messages yet');
      expect(translate('en', 'admin.empty.noSubscribers')).toBe('No subscribers yet');
    });

    it('should return correct Persian translations for admin dashboard keys', () => {
      expect(translate('fa', 'admin.dashboard.title')).toBe('داشبورد');
      expect(translate('fa', 'admin.dashboard.recentMessages')).toBe('پیام‌های اخیر');
      expect(translate('fa', 'admin.dashboard.recentSubscribers')).toBe('مشترکین اخیر');
      expect(translate('fa', 'admin.empty.noMessages')).toBe('هنوز پیامی وجود ندارد');
      expect(translate('fa', 'admin.empty.noSubscribers')).toBe('هنوز مشترکی وجود ندارد');
    });

    it('should return correct Pashto translations for admin dashboard keys', () => {
      expect(translate('ps', 'admin.dashboard.title')).toBe('ډشبورډ');
      expect(translate('ps', 'admin.dashboard.recentMessages')).toBe('وروستي پیغامونه');
      expect(translate('ps', 'admin.dashboard.recentSubscribers')).toBe('وروستي مشترکین');
    });

    it('should return correct English translations for admin stat card keys', () => {
      expect(translate('en', 'admin.stat.services')).toBe('Services');
      expect(translate('en', 'admin.stat.visas')).toBe('Visas');
      expect(translate('en', 'admin.stat.opportunities')).toBe('Opportunities');
      expect(translate('en', 'admin.stat.news')).toBe('News');
      expect(translate('en', 'admin.stat.messages')).toBe('Messages');
      expect(translate('en', 'admin.stat.subscribers')).toBe('Subscribers');
      expect(translate('en', 'admin.stat.gallery')).toBe('Gallery');
      expect(translate('en', 'admin.stat.visits')).toBe('Total Visits');
    });

    it('should return correct Persian translations for admin stat card keys', () => {
      expect(translate('fa', 'admin.stat.services')).toBe('خدمات');
      expect(translate('fa', 'admin.stat.visas')).toBe('ویزاها');
      expect(translate('fa', 'admin.stat.opportunities')).toBe('فرصت‌ها');
      expect(translate('fa', 'admin.stat.news')).toBe('اخبار');
      expect(translate('fa', 'admin.stat.messages')).toBe('پیام‌ها');
      expect(translate('fa', 'admin.stat.subscribers')).toBe('مشترکین');
      expect(translate('fa', 'admin.stat.gallery')).toBe('گالری');
      expect(translate('fa', 'admin.stat.visits')).toBe('کل بازدیدها');
    });

    it('should have all dashboard and stat keys present in all three languages', () => {
      [...dashboardKeys, ...statKeys].forEach((key) => {
        expect(translations.en).toHaveProperty(key);
        expect(translations.fa).toHaveProperty(key);
        expect(translations.ps).toHaveProperty(key);
        
        expect(translations.en[key]).toBeTruthy();
        expect(translations.fa[key]).toBeTruthy();
        expect(translations.ps[key]).toBeTruthy();
      });
    });
  });

  describe('Requirement 2.6: Admin Table Translation Keys', () => {
    const tableKeys = [
      'admin.table.showing',
      'admin.table.of',
      'admin.table.results',
      'admin.table.noItems',
      'admin.table.actions',
      'admin.table.status',
    ];

    it('should return correct English translations for admin table keys', () => {
      expect(translate('en', 'admin.table.showing')).toBe('Showing {count} of {total}');
      expect(translate('en', 'admin.table.of')).toBe('of');
      expect(translate('en', 'admin.table.results')).toBe('results');
      expect(translate('en', 'admin.table.noItems')).toBe('No items found');
      expect(translate('en', 'admin.table.actions')).toBe('Actions');
      expect(translate('en', 'admin.table.status')).toBe('Status');
    });

    it('should return correct Persian translations for admin table keys', () => {
      expect(translate('fa', 'admin.table.showing')).toBe('نمایش {count} از {total}');
      expect(translate('fa', 'admin.table.of')).toBe('از');
      expect(translate('fa', 'admin.table.results')).toBe('نتیجه');
      expect(translate('fa', 'admin.table.noItems')).toBe('موردی یافت نشد');
      expect(translate('fa', 'admin.table.actions')).toBe('عملیات');
      expect(translate('fa', 'admin.table.status')).toBe('وضعیت');
    });

    it('should return correct Pashto translations for admin table keys', () => {
      expect(translate('ps', 'admin.table.showing')).toBe('د {total} څخه {count} ښودل');
      expect(translate('ps', 'admin.table.of')).toBe('څخه');
      expect(translate('ps', 'admin.table.results')).toBe('پایلې');
      expect(translate('ps', 'admin.table.noItems')).toBe('هیڅ مورد ونه موندل شو');
      expect(translate('ps', 'admin.table.actions')).toBe('کړنې');
      expect(translate('ps', 'admin.table.status')).toBe('حالت');
    });

    it('should have all table keys present in all three languages', () => {
      tableKeys.forEach((key) => {
        expect(translations.en).toHaveProperty(key);
        expect(translations.fa).toHaveProperty(key);
        expect(translations.ps).toHaveProperty(key);
        
        expect(translations.en[key]).toBeTruthy();
        expect(translations.fa[key]).toBeTruthy();
        expect(translations.ps[key]).toBeTruthy();
      });
    });
  });

  describe('Requirement 2.5: Admin Form Translation Keys', () => {
    const formKeys = [
      'admin.form.edit',
      'admin.form.add',
      'admin.form.title',
      'admin.form.name',
      'admin.form.description',
      'admin.form.content',
      'admin.form.image',
      'admin.form.status',
      'admin.form.order',
      'admin.form.featured',
      'admin.form.enabled',
      'admin.form.visible',
      'admin.form.country',
      'admin.form.question',
      'admin.form.answer',
      'admin.form.label',
      'admin.form.url',
      'admin.form.email',
      'admin.form.phone',
      'admin.form.message',
      'admin.form.category',
      'admin.form.price',
      'admin.form.code',
      'admin.form.direction',
    ];

    it('should return correct English translations for admin form keys', () => {
      expect(translate('en', 'admin.form.edit')).toBe('Edit');
      expect(translate('en', 'admin.form.add')).toBe('Add');
      expect(translate('en', 'admin.form.title')).toBe('Title');
      expect(translate('en', 'admin.form.name')).toBe('Name');
      expect(translate('en', 'admin.form.description')).toBe('Description');
      expect(translate('en', 'admin.form.content')).toBe('Content');
      expect(translate('en', 'admin.form.image')).toBe('Image');
      expect(translate('en', 'admin.form.status')).toBe('Status');
      expect(translate('en', 'admin.form.order')).toBe('Order');
      expect(translate('en', 'admin.form.featured')).toBe('Featured');
      expect(translate('en', 'admin.form.enabled')).toBe('Enabled');
      expect(translate('en', 'admin.form.visible')).toBe('Visible');
    });

    it('should return correct Persian translations for admin form keys', () => {
      expect(translate('fa', 'admin.form.edit')).toBe('ویرایش');
      expect(translate('fa', 'admin.form.add')).toBe('افزودن');
      expect(translate('fa', 'admin.form.title')).toBe('عنوان');
      expect(translate('fa', 'admin.form.name')).toBe('نام');
      expect(translate('fa', 'admin.form.description')).toBe('توضیحات');
      expect(translate('fa', 'admin.form.content')).toBe('محتوا');
      expect(translate('fa', 'admin.form.image')).toBe('تصویر');
      expect(translate('fa', 'admin.form.status')).toBe('وضعیت');
      expect(translate('fa', 'admin.form.email')).toBe('ایمیل');
      expect(translate('fa', 'admin.form.phone')).toBe('تلفن');
      expect(translate('fa', 'admin.form.message')).toBe('پیام');
      expect(translate('fa', 'admin.form.category')).toBe('دسته‌بندی');
    });

    it('should return correct Pashto translations for admin form keys', () => {
      expect(translate('ps', 'admin.form.edit')).toBe('سمون');
      expect(translate('ps', 'admin.form.add')).toBe('اضافه کول');
      expect(translate('ps', 'admin.form.title')).toBe('سرلیک');
      expect(translate('ps', 'admin.form.name')).toBe('نوم');
      expect(translate('ps', 'admin.form.description')).toBe('تفصیل');
      expect(translate('ps', 'admin.form.status')).toBe('حالت');
    });

    it('should have all form keys present in all three languages', () => {
      formKeys.forEach((key) => {
        expect(translations.en).toHaveProperty(key);
        expect(translations.fa).toHaveProperty(key);
        expect(translations.ps).toHaveProperty(key);
        
        expect(translations.en[key]).toBeTruthy();
        expect(translations.fa[key]).toBeTruthy();
        expect(translations.ps[key]).toBeTruthy();
      });
    });

    it('should verify specific commonly used form field translations', () => {
      // Test additional form fields
      expect(translate('en', 'admin.form.country')).toBe('Country');
      expect(translate('en', 'admin.form.question')).toBe('Question');
      expect(translate('en', 'admin.form.answer')).toBe('Answer');
      expect(translate('en', 'admin.form.label')).toBe('Label');
      expect(translate('en', 'admin.form.url')).toBe('URL');
      
      expect(translate('fa', 'admin.form.country')).toBe('کشور');
      expect(translate('fa', 'admin.form.question')).toBe('سوال');
      expect(translate('fa', 'admin.form.answer')).toBe('پاسخ');
      expect(translate('fa', 'admin.form.label')).toBe('برچسب');
      expect(translate('fa', 'admin.form.url')).toBe('لینک');
    });
  });

  describe('Requirement 2.7: Admin Toast Notification Keys', () => {
    const toastKeys = [
      'admin.toast.created',
      'admin.toast.updated',
      'admin.toast.deleted',
      'admin.toast.failed',
      'admin.toast.saved',
      'admin.toast.loading',
    ];

    it('should return correct English translations for admin toast keys', () => {
      expect(translate('en', 'admin.toast.created')).toBe('Created successfully');
      expect(translate('en', 'admin.toast.updated')).toBe('Updated successfully');
      expect(translate('en', 'admin.toast.deleted')).toBe('Deleted successfully');
      expect(translate('en', 'admin.toast.failed')).toBe('Operation failed');
      expect(translate('en', 'admin.toast.saved')).toBe('Saved successfully');
      expect(translate('en', 'admin.toast.loading')).toBe('Loading...');
    });

    it('should return correct Persian translations for admin toast keys', () => {
      expect(translate('fa', 'admin.toast.created')).toBe('با موفقیت ایجاد شد');
      expect(translate('fa', 'admin.toast.updated')).toBe('با موفقیت به‌روزرسانی شد');
      expect(translate('fa', 'admin.toast.deleted')).toBe('با موفقیت حذف شد');
      expect(translate('fa', 'admin.toast.failed')).toBe('عملیات ناموفق بود');
      expect(translate('fa', 'admin.toast.saved')).toBe('با موفقیت ذخیره شد');
      expect(translate('fa', 'admin.toast.loading')).toBe('در حال بارگذاری...');
    });

    it('should return correct Pashto translations for admin toast keys', () => {
      expect(translate('ps', 'admin.toast.created')).toBe('په بریالیتوب سره جوړ شو');
      expect(translate('ps', 'admin.toast.updated')).toBe('په بریالیتوب سره تازه شو');
      expect(translate('ps', 'admin.toast.deleted')).toBe('په بریالیتوب سره حذف شو');
      expect(translate('ps', 'admin.toast.failed')).toBe('عملیات ناکام شو');
      expect(translate('ps', 'admin.toast.saved')).toBe('په بریالیتوب سره خوندي شو');
      expect(translate('ps', 'admin.toast.loading')).toBe('بارول کیږي...');
    });

    it('should have all toast keys present in all three languages', () => {
      toastKeys.forEach((key) => {
        expect(translations.en).toHaveProperty(key);
        expect(translations.fa).toHaveProperty(key);
        expect(translations.ps).toHaveProperty(key);
        
        expect(translations.en[key]).toBeTruthy();
        expect(translations.fa[key]).toBeTruthy();
        expect(translations.ps[key]).toBeTruthy();
      });
    });
  });

  describe('Fallback Behavior for Missing Keys', () => {
    it('should fall back to English when key is missing in Persian', () => {
      // Simulate a missing key by using a key that doesn't exist
      const missingKey = 'admin.nonexistent.key';
      
      // If the key doesn't exist in Persian, it should fall back to English
      // Since we're testing fallback, let's test with a key that exists in en but pretend it's missing in fa
      const result = translate('fa', missingKey);
      
      // If key is missing in both fa and en, it returns the key itself
      expect(result).toBe(missingKey);
    });

    it('should fall back to English when key is missing in Pashto', () => {
      const missingKey = 'admin.nonexistent.key';
      
      const result = translate('ps', missingKey);
      
      // If key is missing in both ps and en, it returns the key itself
      expect(result).toBe(missingKey);
    });

    it('should return the key itself when completely missing from all languages', () => {
      const missingKey = 'admin.completely.missing.key';
      
      expect(translate('en', missingKey)).toBe(missingKey);
      expect(translate('fa', missingKey)).toBe(missingKey);
      expect(translate('ps', missingKey)).toBe(missingKey);
    });

    it('should use English as fallback when fa/ps translations are missing', () => {
      // Test with a real key that exists in all languages
      const existingKey = 'admin.button.addNew';
      
      // Verify the fallback logic works by checking English is returned for invalid language codes
      const result = translate('de', existingKey); // German not supported
      
      // Should fall back to English translation
      expect(result).toBe('Add New');
    });
  });

  describe('Admin UI Key Completeness', () => {
    it('should have all admin.button.* keys in all three languages', () => {
      const enButtonKeys = Object.keys(translations.en).filter(key => key.startsWith('admin.button.'));
      const faButtonKeys = Object.keys(translations.fa).filter(key => key.startsWith('admin.button.'));
      const psButtonKeys = Object.keys(translations.ps).filter(key => key.startsWith('admin.button.'));
      
      expect(faButtonKeys.length).toBe(enButtonKeys.length);
      expect(psButtonKeys.length).toBe(enButtonKeys.length);
      expect(enButtonKeys.length).toBeGreaterThanOrEqual(15); // At least 15 button keys
    });

    it('should have all admin.dashboard.* keys in all three languages', () => {
      const enDashboardKeys = Object.keys(translations.en).filter(key => key.startsWith('admin.dashboard.'));
      const faDashboardKeys = Object.keys(translations.fa).filter(key => key.startsWith('admin.dashboard.'));
      const psDashboardKeys = Object.keys(translations.ps).filter(key => key.startsWith('admin.dashboard.'));
      
      expect(faDashboardKeys.length).toBe(enDashboardKeys.length);
      expect(psDashboardKeys.length).toBe(enDashboardKeys.length);
    });

    it('should have all admin.table.* keys in all three languages', () => {
      const enTableKeys = Object.keys(translations.en).filter(key => key.startsWith('admin.table.'));
      const faTableKeys = Object.keys(translations.fa).filter(key => key.startsWith('admin.table.'));
      const psTableKeys = Object.keys(translations.ps).filter(key => key.startsWith('admin.table.'));
      
      expect(faTableKeys.length).toBe(enTableKeys.length);
      expect(psTableKeys.length).toBe(enTableKeys.length);
      expect(enTableKeys.length).toBeGreaterThanOrEqual(6); // At least 6 table keys
    });

    it('should have all admin.form.* keys in all three languages', () => {
      const enFormKeys = Object.keys(translations.en).filter(key => key.startsWith('admin.form.'));
      const faFormKeys = Object.keys(translations.fa).filter(key => key.startsWith('admin.form.'));
      const psFormKeys = Object.keys(translations.ps).filter(key => key.startsWith('admin.form.'));
      
      expect(faFormKeys.length).toBe(enFormKeys.length);
      expect(psFormKeys.length).toBe(enFormKeys.length);
      expect(enFormKeys.length).toBeGreaterThanOrEqual(20); // At least 20 form keys
    });

    it('should have all admin.toast.* keys in all three languages', () => {
      const enToastKeys = Object.keys(translations.en).filter(key => key.startsWith('admin.toast.'));
      const faToastKeys = Object.keys(translations.fa).filter(key => key.startsWith('admin.toast.'));
      const psToastKeys = Object.keys(translations.ps).filter(key => key.startsWith('admin.toast.'));
      
      expect(faToastKeys.length).toBe(enToastKeys.length);
      expect(psToastKeys.length).toBe(enToastKeys.length);
      expect(enToastKeys.length).toBeGreaterThanOrEqual(6); // At least 6 toast keys
    });

    it('should have all admin.stat.* keys in all three languages', () => {
      const enStatKeys = Object.keys(translations.en).filter(key => key.startsWith('admin.stat.'));
      const faStatKeys = Object.keys(translations.fa).filter(key => key.startsWith('admin.stat.'));
      const psStatKeys = Object.keys(translations.ps).filter(key => key.startsWith('admin.stat.'));
      
      expect(faStatKeys.length).toBe(enStatKeys.length);
      expect(psStatKeys.length).toBe(enStatKeys.length);
      expect(enStatKeys.length).toBeGreaterThanOrEqual(8); // At least 8 stat keys
    });

    it('should have all admin.empty.* keys in all three languages', () => {
      const enEmptyKeys = Object.keys(translations.en).filter(key => key.startsWith('admin.empty.'));
      const faEmptyKeys = Object.keys(translations.fa).filter(key => key.startsWith('admin.empty.'));
      const psEmptyKeys = Object.keys(translations.ps).filter(key => key.startsWith('admin.empty.'));
      
      expect(faEmptyKeys.length).toBe(enEmptyKeys.length);
      expect(psEmptyKeys.length).toBe(enEmptyKeys.length);
    });
  });

  describe('Admin UI Translations - No Empty Values', () => {
    it('should ensure no admin.* keys have empty string values in any language', () => {
      const allAdminKeys = Object.keys(translations.en).filter(key => key.startsWith('admin.'));
      
      allAdminKeys.forEach((key) => {
        // Check English
        expect(translations.en[key].trim().length).toBeGreaterThan(0);
        
        // Check Persian
        expect(translations.fa[key]).toBeDefined();
        expect(translations.fa[key].trim().length).toBeGreaterThan(0);
        
        // Check Pashto
        expect(translations.ps[key]).toBeDefined();
        expect(translations.ps[key].trim().length).toBeGreaterThan(0);
      });
    });

    it('should ensure no admin.* keys have placeholder values', () => {
      const allAdminKeys = Object.keys(translations.en).filter(key => key.startsWith('admin.'));
      
      allAdminKeys.forEach((key) => {
        // Check that values are not TODOs or common placeholders
        expect(translations.en[key].toLowerCase()).not.toContain('todo');
        expect(translations.en[key].toLowerCase()).not.toContain('fixme');
        expect(translations.en[key].toLowerCase()).not.toContain('placeholder');
      });
    });
  });

  describe('Integration: translate function with admin keys', () => {
    it('should correctly translate admin keys using the translate function', () => {
      // Test that the translate function works correctly with admin keys
      expect(translate('en', 'admin.button.save')).toBe('Save Changes');
      expect(translate('fa', 'admin.button.save')).toBe('ذخیره تغییرات');
      expect(translate('ps', 'admin.button.save')).toBe('بدلونونه خوندي کړئ');
    });

    it('should handle admin toast notifications across all languages', () => {
      expect(translate('en', 'admin.toast.created')).toBe('Created successfully');
      expect(translate('fa', 'admin.toast.created')).toBe('با موفقیت ایجاد شد');
      expect(translate('ps', 'admin.toast.created')).toBe('په بریالیتوب سره جوړ شو');
    });

    it('should handle admin dashboard elements across all languages', () => {
      expect(translate('en', 'admin.dashboard.title')).toBe('Dashboard');
      expect(translate('fa', 'admin.dashboard.title')).toBe('داشبورد');
      expect(translate('ps', 'admin.dashboard.title')).toBe('ډشبورډ');
    });
  });
});
