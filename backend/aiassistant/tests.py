from django.test import SimpleTestCase

from aiassistant.fallback_knowledge import get_fallback_reply


class FallbackKnowledgeTests(SimpleTestCase):
    def test_loan_answers_describe_demo_estimate_in_both_languages(self):
        for locale, message, terms in (
            ("en", "loan eligibility", ("demo estimate", "not a bank")),
            ("hi", "ऋण पात्रता", ("डेमो अनुमान", "बैंक")),
        ):
            with self.subTest(locale=locale):
                answer = get_fallback_reply(message, "loan", locale).lower()
                for term in terms:
                    self.assertIn(term.lower(), answer)
                self.assertNotIn("favorable interest", answer)
                self.assertNotIn("अनुकूल ब्याज", answer)

    def test_trust_score_answers_do_not_promise_lending_outcomes(self):
        for locale, message, terms in (
            ("en", "what is trust score", ("completed sales", "does not measure")),
            ("hi", "विश्वास स्कोर क्या है", ("पूरी हुई बिक्री", "नहीं मापता")),
        ):
            with self.subTest(locale=locale):
                answer = get_fallback_reply(message, "trust_score", locale).lower()
                for term in terms:
                    self.assertIn(term.lower(), answer)
                self.assertNotIn("better loan terms", answer)
                self.assertNotIn("बेहतर ऋण शर्तें", answer)

    def test_kcc_answers_link_official_rbi_directions(self):
        for locale in ("en", "hi"):
            with self.subTest(locale=locale):
                answer = get_fallback_reply("KCC", "loan", locale)
                self.assertIn("rbi.org.in/scripts/BS_ViewMasterDirections.aspx?did=343", answer)
