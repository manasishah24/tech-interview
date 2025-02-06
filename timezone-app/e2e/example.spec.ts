import { test, expect } from '@playwright/test';
import { TimezonePage } from './pages/timezone.page';

test.describe('Timezone tests', () => {

    let timezonePage: TimezonePage;

    test.beforeEach(async ({ page }) => {
        timezonePage = new TimezonePage(page);
        await timezonePage.goto();
    });


    test('has title', async ({ page }) => {
        // Expect a title "to contain" a substring.
        await expect(page).toHaveTitle(/Time Keeper/);
    });

    test('should display the user\'s local timezone automatically', async ({ page }) => {
        // Without adding any row, one row with local timezone should already exist
        const localTimezoneRow = page.locator('tr:has-text("You")');
        await expect(localTimezoneRow).toBeVisible();
    });

    test('should sort the table by the current time, earliest first', async ({ page }) => {
        // Add multiple timezones
        await timezonePage.addTimezone('Mountain HQ', 'America/Denver');
        await timezonePage.addTimezone('Central HQ', 'America/Chicago');
        await timezonePage.addTimezone('Eastern HQ', 'America/New_York');
        await timezonePage.addTimezone('Pacific HQ', 'America/Los_Angeles');
        await timezonePage.addTimezone('Honululu HQ', 'Pacific/Honolulu');

        // Get innerText from all rows and save it under times array
        const tableRows = page.locator('table tbody tr');
        const times = await tableRows.allInnerTexts();

        var todayDate = new Date().toLocaleDateString();
        // Since time is the third cell in each row, hence splitting the cell data
        // Saving the sorted timezones in sortedTimes array
        const sortedTimes = times.slice().sort((a, b) => {
            const timeA = a.split('\t')[2]; 
            const timeB = b.split('\t')[2];
            return Date.parse(todayDate + ' ' + timeA) - Date.parse(todayDate + ' ' + timeB);
        });

        // Expecting the results to be sorted
        for (let i = 0; i < times.length; i++) {
            expect(times[i]).toBe(sortedTimes[i]);
        }
    });

    test('should allow the user to add a timezone', async ({ page }) => {
        // Add new time zone and expect the newly added row to be visible
        await timezonePage.addTimezone('Mountain HQ', 'America/Denver');
        const newTimezoneRow = page.locator('text="Mountain HQ"');
        await expect(newTimezoneRow).toBeVisible();
    });

    test('should not allow the deletion of the "You" record', async ({ page }) => {
        // Delete of local(You) record should not be allowed
        await page.goto('/');
        const localTZRow = page.locator('tr:has-text("You")');
        await expect(localTZRow.locator('button:text("Delete")')).toBeDisabled();
    });

    test('should not allow the user to add a timezone with no label', async ({ page }) => {
        // Add new timezone without label and expect that it should not be saved
        await timezonePage.addTimezone('', 'America/Denver');
        await expect(page.locator('tr:has-text("America/Denver")')).toHaveCount(0);
    });

    test('should not allow the user to add a label with no timezone', async ({ page }) => {
        // Add new label without timezone and expect that it should not be saved
        await timezonePage.addTimezone('Tor HQ', '');
        await expect(page.locator('tr:has-text("Tor HQ")')).toHaveCount(0);
    });

    test('should only delete one entry if multiple entries exist with same label name', async ({ page }) => {
        // Add two timezones with same label name and then delete one row
        // expect only one row to be deleted 
        await timezonePage.addTimezone('Pacific HQ', 'America/Los_Angeles');
        const newTimezoneRow = page.locator('tr:has-text("Pacific HQ")');
        await expect(newTimezoneRow).toBeVisible();
        await timezonePage.addTimezone('Pacific HQ', 'Pacific/Honolulu');
        const newUpdatedTimezoneRow = page.locator('tr:has-text("Pacific HQ")');
        await expect(newUpdatedTimezoneRow).toHaveCount(2);
        await timezonePage.deleteTimezone('Pacific HQ');
        await expect(page.locator('tr:has-text("Pacific HQ")')).toHaveCount(1);
    });

    test('User should be able to delete row which doesn\'t have local time', async ({ page }) => {
        // add new timezone 
        await timezonePage.addTimezone('Pacific HQ', 'America/Los_Angeles');
        const newTimezoneRow = page.locator('tr:has-text("Pacific HQ")');
        await expect(newTimezoneRow).toBeVisible();
        // user should be able to delete non local(you) record
        await timezonePage.deleteTimezone('Pacific HQ');
        await expect(page.locator('tr:has-text("Pacific HQ")')).toHaveCount(0);
    });
});