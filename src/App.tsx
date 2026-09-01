import React, { useState, useEffect } from 'react';

interface Sessao {
  codReuniao: number;
  txtTituloReuniao: string;
  datReuniaoString: string;
}

export default function App() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const carregarSessoes = async () => {
    setLoading(true);
    try {
      // Primeiro precisamos descobrir a última página
      const primeiraUrl = `https://sapl.uba.mg.leg.br/api/sessao-plenaria/`;
      const respPrimeira = await fetch(`https://corsproxy.io/?${encodeURIComponent(primeiraUrl)}`);
      const dadosPrimeira = await respPrimeira.json();
      const ultimaPagina = dadosPrimeira.pagination.total_pages;

      const todasSessoes: Sessao[] = [];

      // Busca as últimas 3 páginas para garantir que pegamos as mais recentes
      for (let pagina = ultimaPagina; pagina >= Math.max(1, ultimaPagina - 2); pagina--) {
        const urlBase = `https://sapl.uba.mg.leg.br/api/sessao-plenaria/?page=${pagina}`;
        const resposta = await fetch(`https://corsproxy.io/?${encodeURIComponent(urlBase)}`);
        const dados = await resposta.json();
        todasSessoes.push(...dados.results);
      }

      todasSessoes.sort((a, b) => b.codReuniao - a.codReuniao);
      setSessoes(todasSessoes);
      
      const agora = new Date();
      setUltimaAtualizacao(agora.toLocaleString("pt-BR"));
    } catch (e) {
      console.error("Erro ao buscar sessões:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarSessoes();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca]);

  const somenteData = (data: string) => {
    return data.split(" ")[0];
  };

  const tituloCurto = (texto: string) => {
    const match = texto.match(/^(\d+ª)\s+(Ordinária|Extraordinária|Solene)/);
    if (match) {
      return `${match[1]} Reunião ${match[2]}`;
    }
    return texto.replace(/ da .*$/, "");
  };

  const sessoesFiltradas = sessoes.filter((sessao) => {
    const termo = busca.toLowerCase();
    const texto = (sessao.txtTituloReuniao + " " + sessao.datReuniaoString).toLowerCase();
    return texto.includes(termo);
  });

  const proxima = sessoesFiltradas.length > 0 ? sessoesFiltradas[0] : null;
  const historicoTotal = sessoesFiltradas.slice(1);
  
  const ITENS_POR_PAGINA = 9;
  const totalPaginas = Math.ceil(historicoTotal.length / ITENS_POR_PAGINA);
  const historico = historicoTotal.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  return (
    <div className="min-h-screen bg-transparent text-[#333333]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      {/* CONTAINER PRINCIPAL */}
      <main className="w-full mx-auto py-4">
        
        <p className="mb-6 text-[15px] leading-relaxed text-[#333333]">
          Acompanhe as pautas das sessões da Câmara Municipal de Ubá e mantenha-se informado sobre os trabalhos legislativos.
        </p>

        {/* BUSCA */}
        <div className="relative mb-10">
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-[15px] focus:outline-none focus:border-[#004a94] focus:ring-1 focus:ring-[#004a94] transition-all bg-white shadow-sm"
            placeholder="Pesquisar por número, tipo ou data da sessão..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#004a94]">
            <p className="text-[15px] font-medium">Carregando pautas...</p>
          </div>
        ) : (
          <>
            {/* PRÓXIMA PAUTA EM DESTAQUE */}
            {proxima && (
              <section className="bg-white border-t-4 border-[#004a94] max-w-3xl mx-auto rounded-md p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.06)] mb-12 border-x border-b border-gray-100 flex flex-col items-center text-center">
                <h2 className="text-[#004a94] mb-3 text-[15px] font-bold uppercase tracking-wide">
                  Próxima Pauta
                </h2>
                <div className="text-2xl md:text-3xl text-[#004a94] font-bold mb-4">
                  {tituloCurto(proxima.txtTituloReuniao)}
                </div>
                <div className="inline-flex items-center bg-[#f4f7fb] text-[#004a94] px-4 py-2 rounded-md font-semibold mb-6 border border-[#e5ecf5] text-[15px]">
                  {somenteData(proxima.datReuniaoString)}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://pauta-camara-uba.camara-uba.workers.dev/pauta/${proxima.codReuniao}/visualizar`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center bg-[#004a94] text-white hover:bg-[#003975] px-5 py-2.5 rounded-md font-bold transition-colors shadow-sm text-[15px]"
                  >
                    Abrir Pauta
                  </a>
                  <a
                    href={`https://sapl.uba.mg.leg.br/sessao/${proxima.codReuniao}/resumo`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center bg-[#f4f7fb] text-[#004a94] hover:bg-[#e5ecf5] px-5 py-2.5 rounded-md font-bold transition-colors border border-[#dce5f0] text-[15px]"
                  >
                    Ver Resumo
                  </a>
                </div>
              </section>
            )}

            {/* HISTÓRICO DE PAUTAS */}
            {historico.length > 0 && (
              <>
                <h2 className="mt-12 mb-6 pt-6 border-t border-gray-200 text-[#004a94] text-xl font-bold">
                  Histórico de Pautas
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {historico.map((sessao) => (
                    <div 
                      key={sessao.codReuniao} 
                      className="bg-white rounded-md p-5 shadow-sm border border-gray-200 flex flex-col transition-colors hover:border-[#004a94]"
                    >
                      <h3 className="text-[#004a94] mb-3 text-lg font-bold leading-tight">
                        {tituloCurto(sessao.txtTituloReuniao)}
                      </h3>
                      
                      <div className="text-gray-500 mb-5 text-[14px] font-medium mt-auto">
                        Data: {somenteData(sessao.datReuniaoString)}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`https://pauta-camara-uba.camara-uba.workers.dev/pauta/${sessao.codReuniao}/visualizar`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center bg-[#f4f7fb] text-[#004a94] hover:bg-[#e5ecf5] px-3 py-2 rounded text-[14px] font-bold transition-colors flex-1 justify-center border border-[#e5ecf5]"
                        >
                          Abrir Pauta
                        </a>
                        <a
                          href={`https://sapl.uba.mg.leg.br/sessao/${sessao.codReuniao}/resumo`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center bg-[#f8f9fa] text-gray-700 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded text-[14px] font-bold transition-colors flex-1 justify-center"
                        >
                          Ver Resumo
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CONTROLES DE PAGINAÇÃO */}
                {totalPaginas > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-10">
                    <button
                      onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                      disabled={paginaAtual === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-[14px] text-gray-600 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Anterior
                    </button>
                    <span className="text-[14px] text-gray-600 font-medium">
                      Página {paginaAtual} de {totalPaginas}
                    </span>
                    <button
                      onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
                      disabled={paginaAtual === totalPaginas}
                      className="px-4 py-2 border border-gray-300 rounded-md text-[14px] text-gray-600 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}

            {sessoesFiltradas.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-[15px]">Nenhuma pauta encontrada para a sua busca.</p>
              </div>
            )}
          </>
        )}

        {/* RODAPÉ */}
        {!loading && (
          <div className="mt-10 pt-6 border-t border-gray-100 text-left text-gray-400 text-[13px]">
            Última atualização: {ultimaAtualizacao}
          </div>
        )}
      </main>
    </div>
  );
}
