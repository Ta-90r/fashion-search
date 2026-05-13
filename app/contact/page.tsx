export default function Contact() {
  return (
    <div style={{ padding: "40px 20px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      <h1>お問い合わせ</h1>
      <p>不具合報告やご要望は、下記までメールにてご連絡ください。</p>
      <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "12px", marginTop: "20px" }}>
        <p style={{ fontWeight: "bold" }}>support-lookmatch@example.com</p>
        <p style={{ fontSize: "12px", color: "#888" }}>※通常3営業日以内にご返信いたします。</p>
      </div>
      <a href="/" style={{ display: "inline-block", marginTop: "20px", color: "#7b5cff" }}>← トップへ戻る</a>
    </div>
  );
}