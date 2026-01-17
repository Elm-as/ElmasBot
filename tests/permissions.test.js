describe('Permissions', () => {
  test('isSuperAdmin returns true if jid is in SUPER_ADMINS', async () => {
    process.env.SUPER_ADMINS = 'jid1,jid2'
    // Import dynamique après modification de l'env
    const { isSuperAdmin } = await import('../src/services/permissions.js')
    const { env } = await import('../src/config/env.js')
    expect(env.SUPER_ADMINS).toContain('jid1')
    expect(await isSuperAdmin('jid1')).toBe(true)
    expect(await isSuperAdmin('jid3')).toBe(false)
  })
})
