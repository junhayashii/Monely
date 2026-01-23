import csv
import sys
import json
import re
import io
from datetime import datetime
from ofxparse import OfxParser

def clean_payee(name):
    if not name:
        return "Indeterminado"
    
    # 1. Handle common Brazilian bank prefixes
    # Pix, Boleto, Transferência, etc.
    prefixes = [
        r'Transferência (enviada|recebida) pelo Pix - ',
        r'Pagamento de boleto efetuado - ',
        r'Compra no débito - ',
        r'Transferência enviada - ',
        r'Transferência recebida - ',
        r'Pagamento de fatura',
    ]
    
    for p in prefixes:
        name = re.sub(p, '', name, flags=re.IGNORECASE)
    
    # 2. Extract name if there's a separator ' - '
    # Often: Prefix - Name - Info
    if ' - ' in name:
        parts = name.split(' - ')
        # Usually the first part after prefix removal is the name
        name = parts[0]
    
    # 3. Remove CPF/CNPJ and other ID patterns
    # Matches: •••.124.448-••, 10.573.521/0001-91
    name = re.sub(r'\d{2,3}\.\d{3}\.\d{3}/\d{4}-\d{2}', '', name)
    name = re.sub(r'[\d•]{3}\.[\d•]{3}\.[\d•]{3}-[\d•]{2}', '', name)
    
    # 4. Remove common corporate suffixes (Brazil)
    suffixes = [r'\bLTDA\b', r'\bME\b', r'\bEIRELI\b', r'\bS/A\b', r'\bSA\b', r'\bEPP\b', r'\bMEI\b']
    for s in suffixes:
        name = re.sub(s, '', name, flags=re.IGNORECASE)
    
    # 5. Remove leftover bank info pattern (0341) Agência: ...
    name = re.sub(r'\(?\d{4}\)? Agência:.*', '', name)
    
    # 6. Final cleanup
    name = re.sub(r'[\s\.\-\/]+', ' ', name).strip()
    
    return name or "Indeterminado"

def parse_csv(file_path):
    transactions = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Expected columns: Data,Valor,Identificador,Descrição
                date_str = row.get('Data')
                amount_str = row.get('Valor')
                desc = row.get('Descrição', '')
                
                if not date_str or not amount_str:
                    continue
                
                try:
                    # DD/MM/YYYY
                    dt = datetime.strptime(date_str, '%d/%m/%Y')
                    amount = float(amount_str)
                    
                    transactions.append({
                        'id': row.get('Identificador', str(datetime.now().timestamp())),
                        'amount': amount,
                        'date': dt.isoformat(),
                        'memo': desc,
                        'payee': desc,
                        'title': clean_payee(desc),
                        'type': 'credit' if amount > 0 else 'debit'
                    })
                except Exception as e:
                    continue
    except Exception as e:
        return {"error": f"CSV parse error: {str(e)}"}
    return transactions

def parse_ofx(file_path):
    try:
        with open(file_path, 'rb') as fileobj:
            ofx = OfxParser.parse(fileobj)
    except Exception:
        try:
            with open(file_path, 'r', encoding='cp932', errors='ignore') as f:
                content = f.read()
            fileobj = io.BytesIO(content.encode('utf-8'))
            ofx = OfxParser.parse(fileobj)
        except Exception as e:
            return {"error": f"OFX parse error: {str(e)}"}
    
    transactions = []
    for account in ofx.accounts:
        for tx in account.statement.transactions:
            raw_payee = tx.payee or ""
            raw_memo = tx.memo or ""
            desc = raw_payee or raw_memo
            
            transactions.append({
                'id': tx.id,
                'amount': float(tx.amount),
                'date': tx.date.isoformat() if tx.date else None,
                'memo': raw_memo,
                'payee': raw_payee,
                'title': clean_payee(desc),
                'type': tx.type
            })
    return transactions

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if file_path.lower().endswith('.csv'):
        result = parse_csv(file_path)
    else:
        result = parse_ofx(file_path)
        
    print(json.dumps(result, ensure_ascii=False))
