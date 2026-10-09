// Module responsible for validating Tapak's operator-to-courier end-user journey.
import { mkdir, rm } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

const evidence = 'artifacts/screenshots';

test.beforeAll(async () => {
  await rm(evidence, { recursive: true, force: true });
  await mkdir(evidence, { recursive: true });
});

test('operator assignment becomes location-backed courier delivery proof', async ({
  browser,
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Email').fill('operator@tapak.local');
  await page.getByLabel('Password').fill('local-tapak-operator');
  await page.getByRole('button', { name: 'Open console' }).click();
  await expect(page.getByText('Every parcel, one accountable trail.')).toBeVisible();
  await page.screenshot({
    path: `${evidence}/01-operator-empty.jpg`,
    fullPage: true,
    type: 'jpeg',
    quality: 88,
  });

  await page.getByRole('button', { name: 'New parcel' }).click();
  await page.screenshot({
    path: `${evidence}/02-operator-create.jpg`,
    fullPage: true,
    type: 'jpeg',
    quality: 88,
  });
  await page.getByLabel('Recipient name').fill('Nadia Putri');
  await page.getByLabel('Phone').fill('+628123456789');
  await page.getByLabel('Delivery address').fill('Jalan Majapahit 18, Mojokerto');
  await page.getByRole('button', { name: 'Create and assign' }).click();
  const code = (await page.getByText(/^TPK-/u).first().textContent()) as string;
  await expect(page.getByText('SCANNABLE PARCEL LABEL')).toBeVisible();
  await page.screenshot({
    path: `${evidence}/03-operator-label.jpg`,
    fullPage: true,
    type: 'jpeg',
    quality: 88,
  });

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    geolocation: { latitude: -7.4726, longitude: 112.4338 },
    permissions: ['geolocation'],
  });
  const courier = await mobile.newPage();
  courier.on('dialog', (dialog) => void dialog.accept());
  await courier.goto('http://127.0.0.1:4174');
  await courier.screenshot({
    path: `${evidence}/04-courier-login.jpg`,
    fullPage: true,
    type: 'jpeg',
    quality: 88,
  });
  await courier.getByLabel('Email').fill('courier@tapak.local');
  await courier.getByLabel('Password').fill('local-tapak-courier');
  await courier.getByRole('button', { name: 'Open my route' }).click();
  await expect(courier.getByText('Nadia Putri')).toBeVisible();
  await courier.screenshot({
    path: `${evidence}/05-courier-route.jpg`,
    fullPage: true,
    type: 'jpeg',
    quality: 88,
  });

  await courier.getByRole('button', { name: 'Open a journey by code' }).click();
  await courier.screenshot({
    path: `${evidence}/06-courier-scanner.jpg`,
    fullPage: true,
    type: 'jpeg',
    quality: 88,
  });
  await courier.getByPlaceholder('TPK-1234ABCD').fill(code);
  await courier.getByRole('button', { name: 'Open journey' }).click();
  await expect(courier.getByText('Journey evidence')).toBeVisible();
  await courier.screenshot({
    path: `${evidence}/07-courier-assignment.jpg`,
    fullPage: true,
    type: 'jpeg',
    quality: 88,
  });

  await mobile.setOffline(true);
  await courier.getByRole('button', { name: 'Record handoff' }).click();
  await expect(courier.getByText('Picked up')).toBeVisible();
  await mobile.setOffline(false);
  await courier.getByRole('button', { name: 'Back' }).click();
  await expect(courier.getByText(/waiting to sync/u)).toBeVisible();
  await courier.screenshot({
    path: `${evidence}/08-courier-offline-queue.jpg`,
    fullPage: true,
    type: 'jpeg',
    quality: 88,
  });
  await courier.getByRole('button', { name: 'Sync now' }).click();
  await expect(courier.getByText(/waiting to sync/u)).not.toBeVisible();
  await courier.getByText('Nadia Putri').click();
  await expect(courier.getByText('Picked up')).toBeVisible();
  await courier.getByRole('button', { name: 'Record handoff' }).click();
  await expect(courier.getByText('In transit')).toBeVisible();
  await courier.getByRole('button', { name: 'Confirm delivery' }).click();
  await courier.getByRole('button', { name: 'Record handoff' }).click();
  await expect(courier.getByText('Journey complete')).toBeVisible();
  await courier.screenshot({
    path: `${evidence}/09-courier-delivered.jpg`,
    fullPage: true,
    type: 'jpeg',
    quality: 88,
  });

  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Refresh' }).click();
  await page.getByText(code).first().click();
  await expect(page.getByText('Delivered')).toBeVisible();
  await expect(page.getByText('Received by Nadia Putri')).toBeVisible();
  await page.screenshot({
    path: `${evidence}/10-operator-proof.jpg`,
    fullPage: true,
    type: 'jpeg',
    quality: 88,
  });
  await mobile.close();
});
