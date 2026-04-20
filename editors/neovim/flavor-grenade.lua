-- flavor-grenade.lua
-- Neovim lspconfig setup for flavor-grenade-lsp
--
-- Usage: Add this to your Neovim config (init.lua or after/plugin/lsp.lua)
-- Prerequisites: lspconfig plugin installed, flavor-grenade-lsp binary on PATH

local lspconfig = require('lspconfig')
local configs = require('lspconfig.configs')

-- Register the custom server if not already registered
if not configs.flavor_grenade then
  configs.flavor_grenade = {
    default_config = {
      cmd = { 'flavor-grenade-lsp' },
      filetypes = { 'markdown' },
      root_dir = lspconfig.util.root_pattern(
        '.obsidian',
        '.flavor-grenade.toml',
        '.git'
      ),
      single_file_support = true,
      settings = {
        flavorGrenade = {
          linkStyle = 'file-stem',
          completion = {
            candidates = 50,
          },
          diagnostics = {
            suppress = {},
          },
        },
      },
    },
  }
end

lspconfig.flavor_grenade.setup {}
