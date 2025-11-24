import dns.resolver
import dns.rdatatype
import sys


def check_dkim(domain: str, selector: str = "default"):
    """Check DKIM record"""
    dkim_record = f"{selector}._domainkey.{domain}"
    try:
        answers = dns.resolver.resolve(dkim_record, dns.rdatatype.TXT)
        for rdata in answers:
            print(f"DKIM Record found: {rdata}")
            return True
    except Exception as e:
        print(f"DKIM check failed: {str(e)}")
        return False


def check_spf(domain: str):
    """Check SPF record"""
    try:
        answers = dns.resolver.resolve(domain, dns.rdatatype.TXT)
        for rdata in answers:
            if "v=spf1" in str(rdata):
                print(f"SPF Record found: {rdata}")
                return True
    except Exception as e:
        print(f"SPF check failed: {str(e)}")
        return False


def check_dmarc(domain: str):
    """Check DMARC record"""
    dmarc_record = f"_dmarc.{domain}"
    try:
        answers = dns.resolver.resolve(dmarc_record, dns.rdatatype.TXT)
        for rdata in answers:
            print(f"DMARC Record found: {rdata}")
            return True
    except Exception as e:
        print(f"DMARC check failed: {str(e)}")
        return False


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python check_dkim.py <domain> [selector]")
        sys.exit(1)
    
    domain = sys.argv[1]
    selector = sys.argv[2] if len(sys.argv) > 2 else "default"
    
    print(f"Checking DNS records for {domain}...")
    check_dkim(domain, selector)
    check_spf(domain)
    check_dmarc(domain)
