---
name: cybersecurity-methodology
description: Defensive security approach/methodology knowledge - recon, threat modeling, vuln assessment, hardening, incident response. Pairs with web-pentest/oss-forensics tool skills. No exploit/malware code generation (see limits).
version: 1.0.0
metadata:
  loki:
    tags: [security, methodology, defensive]
    related_skills: [web-pentest, oss-forensics, github-code-review]
---

# Cybersecurity Methodology

## General approach (any system)
```
1. Scope       -> what's in bounds, what's authorized to test
2. Recon       -> map assets, exposed services, attack surface
3. Threat model -> STRIDE or attack-tree: what could go wrong, who'd want to
4. Assess      -> known-CVE scan, config review, code review (auth/input/crypto)
5. Prioritize  -> CVSS-style: exploitability x impact
6. Remediate   -> patch/config-fix/code-fix, verify fix closes the gap
7. Monitor     -> logging/alerting so recurrence is caught
```

## Common problem categories & where to look
- **Auth/session**: token expiry, weak hashing, session fixation, missing MFA
- **Input handling**: injection (SQL/command/template), deserialization, path traversal
- **Access control**: IDOR, missing authz checks on API routes, privilege escalation paths
- **Crypto**: hardcoded keys, weak algorithms (MD5/SHA1 for passwords), missing TLS
- **Supply chain**: dependency CVEs, typosquats, unpinned versions (see `.github/workflows/supply-chain-audit.yml` pattern)
- **Infra/config**: open ports, default creds, overly permissive IAM/cloud roles
- **Web-specific**: XSS, CSRF, SSRF, open redirects, CORS misconfig

## Incident response (if something's already gone wrong)
```
Contain -> isolate affected system/creds
Eradicate -> remove access, rotate secrets
Recover -> restore from known-good state
Post-mortem -> root cause + one fix that prevents recurrence
```

## Debugging a specific vuln report
Use `systematic-debugging` skill's loop: reproduce -> isolate minimal
trigger -> read the actual code path -> fix -> add regression test.

## Limits
- No exploit/malware/payload code generation, even "for learning" or
  "for a CTF" — explain the vulnerability class and detection/fix instead.
- No help bypassing auth/DRM/anti-cheat on systems you don't own.
- For real engagements: get written authorization first: unauthorized
  testing on third-party systems is illegal in most jurisdictions.
