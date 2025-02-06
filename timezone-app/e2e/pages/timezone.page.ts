import type { Page, Locator } from '@playwright/test';

export class TimezonePage {
    page: Page;
    localTimezoneRecord: Locator;
    addTimezoneNameInput: Locator;
    addTimezoneInput: Locator;
    addTimezoneButton: Locator;
    timezoneTableRows: Locator;
    deleteButtons: Locator;
    saveButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.localTimezoneRecord = page.locator('text="You"');
        this.addTimezoneNameInput = page.locator('input[name="label"]');
        this.addTimezoneInput = page.locator('select[id="timezone"]');
        this.addTimezoneButton = page.locator('button:text("Add timezone")');
        this.timezoneTableRows = page.locator('tbody tr');
        this.deleteButtons = page.locator('button:text("Delete")');
        this.saveButton = page.locator('button:text("Save")');
    }

    async goto() {
        await this.page.goto('/');
    }

    async addTimezone(name: string, timezone: string) {
        // add new TimeZone by selecting TimeZone and adding label name
        await this.addTimezoneButton.click();
        await this.addTimezoneNameInput.fill(name);
        await this.addTimezoneInput.selectOption(timezone);
        await this.saveButton.click();
    }

    async deleteTimezone(name: string) {
        // delete Timezone using label and if multiple rows exist with same labels, delete first row
        const localTZRow = this.page.locator(`tr:has-text("${name}")`);
        await localTZRow.locator('button:text("Delete")').nth(0).click();

    }
}

