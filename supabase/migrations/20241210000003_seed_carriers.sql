-- EVE AI Seed Data: Common California Insurance Carriers
-- Version: 1.0.0

INSERT INTO carriers (name, ivans_code, supported_lines, website, phone, is_active) VALUES
-- Personal Lines Carriers
('State Farm', 'STFM', ARRAY['personal_auto', 'homeowners']::line_of_business[], 'https://www.statefarm.com', '800-782-8332', true),
('Allstate', 'ALLS', ARRAY['personal_auto', 'homeowners']::line_of_business[], 'https://www.allstate.com', '800-255-7828', true),
('Progressive', 'PROG', ARRAY['personal_auto', 'commercial']::line_of_business[], 'https://www.progressive.com', '800-776-4737', true),
('GEICO', 'GEIC', ARRAY['personal_auto']::line_of_business[], 'https://www.geico.com', '800-861-8380', true),
('Farmers Insurance', 'FARM', ARRAY['personal_auto', 'homeowners', 'commercial']::line_of_business[], 'https://www.farmers.com', '888-327-6335', true),
('Liberty Mutual', 'LBMU', ARRAY['personal_auto', 'homeowners']::line_of_business[], 'https://www.libertymutual.com', '800-290-8711', true),
('USAA', 'USAA', ARRAY['personal_auto', 'homeowners']::line_of_business[], 'https://www.usaa.com', '800-531-8722', true),
('Nationwide', 'NATW', ARRAY['personal_auto', 'homeowners', 'commercial']::line_of_business[], 'https://www.nationwide.com', '877-669-6877', true),
('Travelers', 'TRAV', ARRAY['personal_auto', 'homeowners', 'commercial']::line_of_business[], 'https://www.travelers.com', '800-842-5075', true),
('AAA (CSAA)', 'CSAA', ARRAY['personal_auto', 'homeowners']::line_of_business[], 'https://www.csaa.com', '800-922-8228', true),
('Mercury Insurance', 'MERC', ARRAY['personal_auto', 'homeowners']::line_of_business[], 'https://www.mercuryinsurance.com', '800-956-3728', true),
('Wawanesa', 'WAWA', ARRAY['personal_auto', 'homeowners']::line_of_business[], 'https://www.wawanesa.com', '800-640-2920', true),
('Interinsurance Exchange (AAA)', 'IEXC', ARRAY['personal_auto', 'homeowners']::line_of_business[], 'https://www.aaa.com', '800-922-8228', true),
('21st Century', '21ST', ARRAY['personal_auto']::line_of_business[], 'https://www.21st.com', '888-244-6163', true),

-- Commercial Lines Carriers
('The Hartford', 'HRTF', ARRAY['commercial']::line_of_business[], 'https://www.thehartford.com', '800-243-5860', true),
('CNA Insurance', 'CNAI', ARRAY['commercial']::line_of_business[], 'https://www.cna.com', '877-262-6262', true),
('Chubb', 'CHUB', ARRAY['commercial', 'homeowners']::line_of_business[], 'https://www.chubb.com', '800-252-4670', true),
('Zurich', 'ZURI', ARRAY['commercial']::line_of_business[], 'https://www.zurichna.com', '800-382-2150', true),
('Berkshire Hathaway Guard', 'BERK', ARRAY['commercial']::line_of_business[], 'https://www.guard.com', '800-673-2465', true),
('AmTrust', 'AMTR', ARRAY['commercial']::line_of_business[], 'https://www.amtrustfinancial.com', '877-528-7878', true),
('State Compensation Insurance Fund', 'SCIF', ARRAY['commercial']::line_of_business[], 'https://www.statefundca.com', '888-782-8338', true),

-- Health Insurance Carriers (Covered California)
('Kaiser Permanente', 'KAIS', ARRAY['health']::line_of_business[], 'https://www.kp.org', '800-464-4000', true),
('Blue Shield of California', 'BSCA', ARRAY['health']::line_of_business[], 'https://www.blueshieldca.com', '800-393-6130', true),
('Anthem Blue Cross', 'ANTH', ARRAY['health']::line_of_business[], 'https://www.anthem.com/ca', '800-333-0912', true),
('Health Net', 'HNET', ARRAY['health']::line_of_business[], 'https://www.healthnet.com', '800-522-0088', true),
('Molina Healthcare', 'MOLI', ARRAY['health']::line_of_business[], 'https://www.molinahealthcare.com', '888-665-4621', true),
('Oscar Health', 'OSCA', ARRAY['health']::line_of_business[], 'https://www.hioscar.com', '855-672-2788', true),
('LA Care Health Plan', 'LACA', ARRAY['health']::line_of_business[], 'https://www.lacare.org', '888-839-9909', true),
('Chinese Community Health Plan', 'CCHP', ARRAY['health']::line_of_business[], 'https://www.cchphealthplan.com', '888-775-7888', true),

-- Life Insurance Carriers
('Northwestern Mutual', 'NWMU', ARRAY['life']::line_of_business[], 'https://www.northwesternmutual.com', '866-950-4644', true),
('New York Life', 'NYLF', ARRAY['life']::line_of_business[], 'https://www.newyorklife.com', '800-695-4331', true),
('Prudential', 'PRUD', ARRAY['life']::line_of_business[], 'https://www.prudential.com', '800-778-2255', true),
('MetLife', 'METL', ARRAY['life']::line_of_business[], 'https://www.metlife.com', '800-638-5433', true),
('Lincoln Financial', 'LINC', ARRAY['life']::line_of_business[], 'https://www.lfg.com', '877-275-5462', true);
