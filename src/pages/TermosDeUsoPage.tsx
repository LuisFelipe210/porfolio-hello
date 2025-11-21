import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";

const TermosDeUsoPage = () => {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-orange-200">
            <Helmet>
                <title>Termos de Uso | Hellô Borges Fotografia</title>
                <meta name="description" content="Termos e condições de uso do site Hellô Borges Fotografia." />
            </Helmet>

            <Header />

            <main className="pt-32 md:pt-40 pb-20 bg-white">
                {/* CABEÇALHO DA PÁGINA */}
                <div className="container mx-auto px-6 max-w-3xl text-center mb-20 animate-fade-in-up">
                    <span className="text-orange-600 text-xs font-bold tracking-[0.2em] uppercase mb-6 block">
                        Informações Legais
                    </span>
                    {/* Título PRETO */}
                    <h1 className="text-4xl md:text-6xl font-serif text-black mb-6 font-medium">
                        Termos de Uso
                    </h1>
                    <div className="w-px h-16 bg-zinc-300 mx-auto mb-6"></div>
                    {/* Data PRETA */}
                    <p className="text-black text-sm font-bold uppercase tracking-widest">
                        Última atualização: {new Date().toLocaleDateString()}
                    </p>
                </div>

                {/* CONTEÚDO DO DOCUMENTO */}
                <div className="container mx-auto px-6 max-w-3xl">

                    <div className="space-y-16">
                        {/* SEÇÃO 1 */}
                        <section>
                            <h3 className="text-2xl font-serif mb-6 flex items-baseline gap-4 text-black">
                                <span className="text-orange-600 font-sans text-sm font-bold tracking-widest">01.</span>
                                Termos
                            </h3>
                            {/* PARÁGRAFO FORÇADO PRETO */}
                            <p className="leading-relaxed text-black text-base font-normal">
                                Ao acessar ao site <span className="font-bold text-black">Hellô Borges Fotografia</span>, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.
                            </p>
                        </section>

                        <div className="w-full h-px bg-zinc-200"></div>

                        {/* SEÇÃO 2 */}
                        <section>
                            <h3 className="text-2xl font-serif mb-6 flex items-baseline gap-4 text-black">
                                <span className="text-orange-600 font-sans text-sm font-bold tracking-widest">02.</span>
                                Uso de Licença
                            </h3>
                            <p className="leading-relaxed mb-6 text-black text-base font-normal">
                                É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Hellô Borges Fotografia, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob esta licença, você não pode:
                            </p>
                            <ul className="space-y-4 pl-6 border-l-2 border-zinc-300 ml-2 marker:text-orange-600">
                                {[
                                    "Modificar ou copiar os materiais;",
                                    "Usar os materiais para qualquer finalidade comercial ou para exibição pública (comercial ou não comercial);",
                                    "Tentar descompilar ou fazer engenharia reversa de qualquer software contido no site Hellô Borges Fotografia;",
                                    "Remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou",
                                    "Transferir os materiais para outra pessoa ou 'espelhe' os materiais em qualquer outro servidor."
                                ].map((item, index) => (
                                    // LISTA FORÇADA PRETA
                                    <li key={index} className="leading-relaxed text-black text-sm md:text-base font-medium">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 p-6 bg-zinc-100 border-l-4 border-orange-500 text-sm leading-relaxed text-black font-medium">
                                <strong className="text-black block mb-2 uppercase tracking-widest text-xs">Atenção</strong>
                                Esta licença será automaticamente rescindida se você violar alguma dessas restrições e poderá ser rescindida por Hellô Borges Fotografia a qualquer momento.
                            </div>
                        </section>

                        <div className="w-full h-px bg-zinc-200"></div>

                        {/* SEÇÃO 3 */}
                        <section>
                            <h3 className="text-2xl font-serif mb-6 flex items-baseline gap-4 text-black">
                                <span className="text-orange-600 font-sans text-sm font-bold tracking-widest">03.</span>
                                Isenção de responsabilidade
                            </h3>
                            <p className="leading-relaxed text-black text-base font-normal">
                                Os materiais no site da Hellô Borges Fotografia são fornecidos 'como estão'. Hellô Borges Fotografia não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
                            </p>
                        </section>

                        <div className="w-full h-px bg-zinc-200"></div>

                        {/* SEÇÃO 4 */}
                        <section>
                            <h3 className="text-2xl font-serif mb-6 flex items-baseline gap-4 text-black">
                                <span className="text-orange-600 font-sans text-sm font-bold tracking-widest">04.</span>
                                Limitações
                            </h3>
                            <p className="leading-relaxed text-black text-base font-normal">
                                Em nenhum caso o Hellô Borges Fotografia ou seus fornecedores serão responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em Hellô Borges Fotografia, mesmo que Hellô Borges Fotografia ou um representante autorizado da Hellô Borges Fotografia tenha sido notificado oralmente ou por escrito da possibilidade de tais danos.
                            </p>
                        </section>

                        <div className="w-full h-px bg-zinc-200"></div>

                        {/* SEÇÃO 5 */}
                        <section>
                            <h3 className="text-2xl font-serif mb-6 flex items-baseline gap-4 text-black">
                                <span className="text-orange-600 font-sans text-sm font-bold tracking-widest">05.</span>
                                Precisão dos materiais
                            </h3>
                            <p className="leading-relaxed text-black text-base font-normal">
                                Os materiais exibidos no site da Hellô Borges Fotografia podem incluir erros técnicos, tipográficos ou fotográficos. Hellô Borges Fotografia não garante que qualquer material em seu site seja preciso, completo ou atual. Hellô Borges Fotografia pode fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio.
                            </p>
                        </section>

                        <div className="w-full h-px bg-zinc-200"></div>

                        {/* SEÇÃO 6 */}
                        <section>
                            <h3 className="text-2xl font-serif mb-6 flex items-baseline gap-4 text-black">
                                <span className="text-orange-600 font-sans text-sm font-bold tracking-widest">06.</span>
                                Links
                            </h3>
                            <p className="leading-relaxed text-black text-base font-normal">
                                O Hellô Borges Fotografia não analisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso por Hellô Borges Fotografia do site. O uso de qualquer site vinculado é por conta e risco do usuário.
                            </p>
                        </section>

                        <div className="w-full h-px bg-zinc-200"></div>

                        {/* SEÇÃO 7 */}
                        <section>
                            <h3 className="text-2xl font-serif mb-6 flex items-baseline gap-4 text-black">
                                <span className="text-orange-600 font-sans text-sm font-bold tracking-widest">07.</span>
                                Modificações
                            </h3>
                            <p className="leading-relaxed text-black text-base font-normal">
                                O Hellô Borges Fotografia pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
                            </p>
                        </section>

                        <div className="w-full h-px bg-zinc-200"></div>

                        {/* SEÇÃO 8 */}
                        <section>
                            <h3 className="text-2xl font-serif mb-6 flex items-baseline gap-4 text-black">
                                <span className="text-orange-600 font-sans text-sm font-bold tracking-widest">08.</span>
                                Lei aplicável
                            </h3>
                            <p className="leading-relaxed text-black text-base font-normal">
                                Estes termos e condições são regidos e interpretados de acordo com as leis do Hellô Borges Fotografia e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TermosDeUsoPage;