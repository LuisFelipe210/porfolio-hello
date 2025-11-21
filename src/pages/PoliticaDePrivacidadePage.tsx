import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";

const PoliticaDePrivacidadePage = () => {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-orange-200">
            <Helmet>
                <title>Política de Privacidade | Hellô Borges Fotografia</title>
                <meta name="description" content="Saiba como tratamos seus dados e protegemos sua privacidade." />
            </Helmet>

            <Header />

            <main className="pt-32 md:pt-40 pb-20 bg-white">
                {/* CABEÇALHO */}
                <div className="container mx-auto px-6 max-w-3xl text-center mb-20 animate-fade-in-up">
                    <span className="text-orange-600 text-xs font-bold tracking-[0.2em] uppercase mb-6 block">
                        Informações Legais
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif text-black mb-6 font-medium">
                        Política de Privacidade
                    </h1>
                    <div className="w-px h-16 bg-zinc-300 mx-auto mb-6"></div>
                    <p className="text-black text-sm font-bold uppercase tracking-widest">
                        Última atualização: {new Date().toLocaleDateString()}
                    </p>
                </div>

                {/* CONTEÚDO */}
                <div className="container mx-auto px-6 max-w-3xl">
                    <div className="space-y-16">

                        {/* INTRODUÇÃO */}
                        <section>
                            <p className="leading-relaxed text-black text-base font-normal p-6 bg-zinc-100 border-l-4 border-orange-600">
                                A sua privacidade é importante para nós. É política do Hellô Borges Fotografia respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site <a href="https://helloborges.com.br" className="text-black font-bold hover:text-orange-600 underline decoration-orange-600 decoration-2 underline-offset-4">Hellô Borges Fotografia</a>, e outros sites que possuímos e operamos.
                            </p>
                        </section>

                        {/* SEÇÃO 1 */}
                        <section>
                            <h3 className="text-2xl font-serif mb-6 flex items-baseline gap-4 text-black">
                                <span className="text-orange-600 font-sans text-sm font-bold tracking-widest">01.</span>
                                Informações que coletamos
                            </h3>
                            <p className="leading-relaxed text-black text-base font-normal">
                                Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
                            </p>
                        </section>

                        <div className="w-full h-px bg-zinc-200"></div>

                        {/* SEÇÃO 2 */}
                        <section>
                            <h3 className="text-2xl font-serif mb-6 flex items-baseline gap-4 text-black">
                                <span className="text-orange-600 font-sans text-sm font-bold tracking-widest">02.</span>
                                Uso de Dados
                            </h3>
                            <p className="leading-relaxed text-black text-base font-normal">
                                Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
                            </p>
                        </section>

                        <div className="w-full h-px bg-zinc-200"></div>

                        {/* SEÇÃO 3 */}
                        <section>
                            <h3 className="text-2xl font-serif mb-6 flex items-baseline gap-4 text-black">
                                <span className="text-orange-600 font-sans text-sm font-bold tracking-widest">03.</span>
                                Compartilhamento
                            </h3>
                            <p className="leading-relaxed text-black text-base font-normal">
                                Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
                            </p>
                        </section>

                        <div className="w-full h-px bg-zinc-200"></div>

                        {/* SEÇÃO 4 */}
                        <section>
                            <h3 className="text-2xl font-serif mb-6 flex items-baseline gap-4 text-black">
                                <span className="text-orange-600 font-sans text-sm font-bold tracking-widest">04.</span>
                                Cookies
                            </h3>
                            <p className="leading-relaxed text-black text-base font-normal">
                                O nosso site pode usar "cookies" para melhorar a experiência do usuário. Você tem a opção de aceitar ou recusar esses cookies e saber quando um cookie está sendo enviado para o seu dispositivo.
                            </p>
                        </section>

                        <div className="w-full h-px bg-zinc-200"></div>

                        {/* SEÇÃO 5 */}
                        <section>
                            <h3 className="text-2xl font-serif mb-6 flex items-baseline gap-4 text-black">
                                <span className="text-orange-600 font-sans text-sm font-bold tracking-widest">05.</span>
                                Compromisso do Usuário
                            </h3>
                            <p className="leading-relaxed mb-6 text-black text-base font-normal">
                                O usuário se compromete a fazer uso adequado dos conteúdos e da informação que o Hellô Borges Fotografia oferece no site e com caráter enunciativo, mas não limitativo:
                            </p>

                            <ul className="space-y-4 pl-6 border-l-2 border-zinc-300 ml-2 marker:text-orange-600">
                                <li className="leading-relaxed text-black text-base font-normal">
                                    <strong className="text-black mr-2">A)</strong> Não se envolver em atividades que sejam ilegais ou contrárias à boa fé a à ordem pública;
                                </li>
                                <li className="leading-relaxed text-black text-base font-normal">
                                    <strong className="text-black mr-2">B)</strong> Não difundir propaganda ou conteúdo de natureza racista, xenofóbica, casas de apostas, jogos de sorte e azar, qualquer tipo de pornografia ilegal, de apologia ao terrorismo ou contra os direitos humanos;
                                </li>
                                <li className="leading-relaxed text-black text-base font-normal">
                                    <strong className="text-black mr-2">C)</strong> Não causar danos aos sistemas físicos (hardwares) e lógicos (softwares) do Hellô Borges Fotografia, de seus fornecedores ou terceiros.
                                </li>
                            </ul>
                        </section>

                        <div className="w-full h-px bg-zinc-200"></div>

                        {/* SEÇÃO 6 */}
                        <section className="pt-4">
                            <h3 className="text-xl font-bold mb-4 text-black uppercase tracking-widest text-sm">Mais informações</h3>
                            <p className="leading-relaxed text-black text-base font-normal">
                                Esperemos que esteja esclarecido e, como mencionado anteriormente, se houver algo que você não tem certeza se precisa ou não, geralmente é mais seguro deixar os cookies ativados, caso interaja com um dos recursos que você usa em nosso site.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PoliticaDePrivacidadePage;